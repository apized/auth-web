import React, { useCallback, useEffect, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { ApiKey, createApiKey, listApiKeys, revokeApiKey } from '../api/ApiKeys';
import { useSnackbar } from 'notistack';

const ApiKeyManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [ apiKeys, setApiKeys ] = useState<ApiKey[]>([]);
  const [ loading, setLoading ] = useState(true);
  const [ working, setWorking ] = useState(false);
  const [ name, setName ] = useState('');
  const [ createdKey, setCreatedKey ] = useState<string>();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setApiKeys((await listApiKeys()).content);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to load API keys', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [ enqueueSnackbar ]);

  useEffect(() => { load(); }, [ load ]);

  const create = async () => {
    if (!name.trim()) return;
    try {
      setWorking(true);
      const apiKey = await createApiKey(name.trim());
      setApiKeys((current) => [ ...current, { id: apiKey.id, name: apiKey.name } ]);
      setCreatedKey(apiKey.key);
      setName('');
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to create API key', { variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const revoke = async (apiKey: ApiKey) => {
    if (!apiKey.id || !window.confirm(`Revoke API key "${apiKey.name}"? This cannot be undone.`)) return;
    try {
      setWorking(true);
      await revokeApiKey(apiKey.id);
      setApiKeys((current) => current.filter(({ id }) => id !== apiKey.id));
      enqueueSnackbar('API key revoked', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to revoke API key', { variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const copy = async () => {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey);
      enqueueSnackbar('API key copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to copy API key', { variant: 'error' });
    }
  };

  return (
    <Stack spacing="1em">
      <Typography variant="body2">API keys are shown only once when created. Store them securely.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing="1em">
        <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} disabled={working}/>
        <Button variant="contained" disabled={working || !name.trim()} onClick={create}>Create API key</Button>
      </Stack>
      {loading ? <CircularProgress size="1.5em"/> : (
        <List dense disablePadding>
          {apiKeys.map((apiKey) => (
            <ListItem key={apiKey.id} secondaryAction={
              <IconButton aria-label={`Revoke ${apiKey.name}`} disabled={working} onClick={() => revoke(apiKey)}>
                <DeleteIcon/>
              </IconButton>
            }>
              <ListItemText primary={apiKey.name}/>
            </ListItem>
          ))}
          {!apiKeys.length && <Typography variant="body2">No API keys created.</Typography>}
        </List>
      )}
      <Dialog open={Boolean(createdKey)} onClose={() => setCreatedKey(undefined)}>
        <DialogTitle>Copy your API key now</DialogTitle>
        <DialogContent>
          <Typography paragraph>This secret will not be shown again.</Typography>
          <TextField fullWidth value={createdKey || ''} InputProps={{ readOnly: true }} inputProps={{ 'aria-label': 'New API key' }}/>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<ContentCopyIcon/>} onClick={copy}>Copy</Button>
          <Button onClick={() => setCreatedKey(undefined)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ApiKeyManager;
