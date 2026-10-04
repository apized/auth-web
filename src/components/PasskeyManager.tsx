import React, { useCallback, useEffect, useState } from 'react';
import { Button, CircularProgress, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deletePasskey, isPasskeySupported, listPasskeys, Passkey, registerPasskey } from '../api/Passkeys';
import { useSnackbar } from 'notistack';

const displayName = (passkey: Passkey): string => {
  return passkey.aaguid ? `Passkey ${passkey.aaguid}` : `Passkey ${passkey.credentialId?.slice(0, 12) || passkey.id}`;
};

const PasskeyManager = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [ passkeys, setPasskeys ] = useState<Passkey[]>([]);
  const [ loading, setLoading ] = useState(true);
  const [ working, setWorking ] = useState(false);
  const supported = isPasskeySupported();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPasskeys(await listPasskeys());
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to load passkeys', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [ enqueueSnackbar ]);

  useEffect(() => { load(); }, [ load ]);

  const register = async () => {
    try {
      setWorking(true);
      const passkey = await registerPasskey();
      setPasskeys((current) => [ ...current, passkey ]);
      enqueueSnackbar('Passkey added', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to add passkey', { variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const remove = async (passkey: Passkey) => {
    if (!passkey.id || !window.confirm(`Remove ${displayName(passkey)}?`)) return;
    try {
      setWorking(true);
      await deletePasskey(passkey.id);
      setPasskeys((current) => current.filter(({ id }) => id !== passkey.id));
      enqueueSnackbar('Passkey removed', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : 'Unable to remove passkey', { variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  if (!supported) return <Typography>Your browser does not support passkeys.</Typography>;

  return (
    <Stack spacing="1em">
      <Typography variant="body2">Use a device passkey to sign in without your password.</Typography>
      {loading ? <CircularProgress size="1.5em"/> : (
        <List dense disablePadding>
          {passkeys.map((passkey) => (
            <ListItem key={passkey.id} secondaryAction={
              <IconButton aria-label={`Remove ${displayName(passkey)}`} disabled={working} onClick={() => remove(passkey)}>
                <DeleteIcon/>
              </IconButton>
            }>
              <ListItemText primary={displayName(passkey)} secondary={passkey.transports?.join(', ')}/>
            </ListItem>
          ))}
          {!passkeys.length && <Typography variant="body2">No passkeys registered.</Typography>}
        </List>
      )}
      <Button variant="contained" disabled={working} onClick={register}>Add passkey</Button>
    </Stack>
  );
};

export default PasskeyManager;
