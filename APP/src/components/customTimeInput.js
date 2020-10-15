import React from "react";

class CustomTimeInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: props.initTime || "00:00",
    };
  }

  isValid = (value) => {
    const [hora, minuto] = value.split(":");

    if (hora === undefined || minuto === undefined) {
      return false;
    }

    if (hora.length > 2 || minuto.length > 2) {
      return false;
    }

    if (!value.includes(":")) {
      return false;
    }

    if (parseInt(hora) > 23 || parseInt(minuto) > 59) {
      return false;
    }
    for (let i = 0; i < value.length; i++) {
      if (isNaN(value[i]) && value[i] !== ":") {
        return false;
      }
    }
    return true;
  };

  completeText = () => {
    const { inputValue } = this.state;
    const { onTimeChange } = this.props;
    let [hora, minuto] = inputValue.split(":");
    
    if (hora === undefined || hora.length === 0) {
      hora = "00";
    } else {
      if (hora.length < 2) {
        hora = "0" + hora;
      }
    }

    if (minuto === undefined || minuto.length === 0) {
      minuto = "00";
    } else {
      if (minuto.length < 2) {
        minuto = "0" + minuto;
      }
    }

    const resultado = `${hora}:${minuto}`;

    this.setState(
      {
        inputValue: resultado,
      },
      () => {
        onTimeChange(resultado);
      }
    );
  };

  onInputChange = (event) => {
    const { onTimeChange } = this.props;
    let value = event.target.value;
    if (!this.isValid(value)) return;

    this.setState(
      {
        inputValue: value,
      },
      () => {
        onTimeChange(value);
      }
    );
  };
  render() {
    const { inputValue } = this.state;
    const { style, className, disabled } = this.props;
    return (
      <input
        style={style}
        disabled={disabled}
        className={className}
        onBlur={this.completeText}
        onChange={this.onInputChange}
        type="text"
        value={inputValue}
      />
    );
  }
}

export default CustomTimeInput;
