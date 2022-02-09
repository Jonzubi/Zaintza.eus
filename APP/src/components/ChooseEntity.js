import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { colors } from '../util/colors';
import { trans } from '../util/funciones';

const ChooseEntity = ({ nombreEntidad, icono, onSelectEntidad, selectedOn, error, entidad }) => (
    <div onClick={onSelectEntidad} style={{ backgroundColor: entidad === selectedOn ? colors.green : colors.white, borderRadius: 7, cursor: 'pointer', border: error ? `1px solid ${colors.red}` : '' }} className="d-flex flex-column align-items-center p-3">
        <FontAwesomeIcon size="2x" icon={icono} className="" style={{ color: entidad === selectedOn ? colors.white : colors.green }} />
        <h5 style={{ color: entidad === selectedOn ? colors.white : colors.black }} className="mt-2">{trans(nombreEntidad)}</h5>
    </div>);

export default ChooseEntity;