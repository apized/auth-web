import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack } from "@mui/material";
import React, { useState } from "react";
import ApizedAuditTrail from "./ApizedAuditTrail";
import { Service } from "../../api/Api";
import { Close } from "@mui/icons-material";

const ApizedAudit = ({ service, entity, target }: { service: Service, entity: string, target?: string }) => {
  const [ open, setOpen ] = useState(false);

  return (
    <>
      <Button variant={"contained"} disabled={!target} onClick={() => setOpen(true)}>Audit</Button>
      <Dialog
        fullWidth
        open={open}
        maxWidth={"xl"}
      >
        <DialogTitle>
          <Stack direction={"row"} justifyContent={"space-between"}><span>Audit Trail</span><IconButton
            onClick={() => setOpen(false)}><Close/>
          </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ padding: '1em' }}>
            <ApizedAuditTrail
              service={service}
              entity={entity}
              target={target!}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ApizedAudit;