import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Input,
    FormControl,
    InputAdornment,
    InputLabel,
    Slide,
    CircularProgress
} from '@material-ui/core';
import ClipLoader from "react-spinners/ClipLoader";
import axios from '../util/axiosInstance';
import protocol from '../util/protocol';
import ipMaquina from '../util/ipMaquinaAPI';
import { Email } from '@material-ui/icons';
import { colors } from '../util/colors';
import { trans } from '../util/funciones';
import cogoToast from 'cogo-toast';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ResetPasswordModal = (props) => {
    const { closeModal } = props;
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);


    const handleEnviarResetEmail = async () => {
        setLoading(true);
        const response = await axios.post(`${protocol}://${ipMaquina}:3001/api/procedures/newResetPasswordRequest`, { email })
            .catch((err) => {
                console.log(err.response);
                if (err.response.status === 400) {
                    cogoToast.error(
                        <h5>{trans('notificaciones.emailNoExiste')}</h5>
                    );
                    return;
                }
            });
        if (response !== undefined) {
            await axios.post(`${protocol}://${ipMaquina}:3003/smtp/sendResetPasswordEmail`, { email });
            
            closeModal();
            cogoToast.success(
                <h5>{trans('notificaciones.resetPasswordEmail')}</h5>
            );
        }
        setLoading(false);
    }

    return (
        <Dialog
            open
            TransitionComponent={Transition}
            fullWidth
            onClose={closeModal}
        >
            <DialogTitle id="alert-dialog-slide-title">{trans('resetPasswordModal.title')}</DialogTitle>
            <DialogContent>
                <FormControl style={{ width: '100%' }}>
                    <InputLabel htmlFor="input-with-icon-adornment">{trans('resetPasswordModal.email')}</InputLabel>
                    <Input
                        onChange={(e) => setEmail(e.target.value)}
                        id="input-with-icon-adornment"
                        value={email}
                        startAdornment={
                            <InputAdornment position="start">
                                <Email style={{ fill: colors.green }} />
                            </InputAdornment>
                        }
                    />
                </FormControl>
            </DialogContent>
            {!loading ?
                <DialogActions>
                    <Button onClick={closeModal} color="primary">
                        {trans('resetPasswordModal.cancel')}
                    </Button>
                    <Button onClick={handleEnviarResetEmail} color="primary">
                        {trans('resetPasswordModal.send')}
                    </Button>
                </DialogActions>
                :
                <div
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 30, paddingBottom: 15 }}
                >
                    <ClipLoader color={colors.green} />
                </div>
            }
        </Dialog>
    );
}

export default ResetPasswordModal;