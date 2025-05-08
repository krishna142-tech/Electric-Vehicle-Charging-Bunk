import { FC, useState, useEffect } from 'react';
import { Alert, Snackbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Firestore, enableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';

interface FirebaseConnectionErrorProps {
  error?: string;
}

const FirebaseConnectionError: FC<FirebaseConnectionErrorProps> = ({ error }) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setOpen(true);
    }
  }, [error]);

  const handleRetry = async () => {
    try {
      await enableNetwork(db as Firestore);
      setOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to re-enable network:', err);
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity="warning"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry Connection
            </Button>
          }
        >
          {error || 'Connection to our services is blocked. Please check your ad blocker settings.'}
        </Alert>
      </Snackbar>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Connection Issue</DialogTitle>
        <DialogContent>
          <Typography>
            We're having trouble connecting to our services. This might be because:
            <ul>
              <li>You have an ad blocker enabled</li>
              <li>Your firewall is blocking the connection</li>
              <li>You're using a privacy extension that blocks Firebase</li>
            </ul>
            To fix this:
            <ul>
              <li>Disable your ad blocker for this site</li>
              <li>Add an exception for *.firebaseapp.com and *.googleapis.com</li>
              <li>Check your firewall settings</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button onClick={() => window.location.reload()} variant="contained">
            Reload Page
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FirebaseConnectionError; 