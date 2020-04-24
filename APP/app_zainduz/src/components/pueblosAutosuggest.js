import React from "react";
import AutoSuggest from "react-autosuggest";
import municipios from "../util/municipos";
import { trans } from "../util/funciones";
import cogoToast from "cogo-toast";

class PueblosAutosuggest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestionsPueblos: [],
      auxAddPueblo: ""
    };
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestionsPueblos: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestionsPueblos: []
    });
  };

  getSuggestionValue = suggestion => {
    return suggestion;
  };

  renderSuggestion = suggestion => {
    return <span>{suggestion}</span>;
  };

  escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  getSuggestions = (value) => {
    const escapedValue = this.escapeRegexCharacters(value.trim());

    if (escapedValue === "") {
      return [];
    }

    const regex = new RegExp("^" + escapedValue, "i");

    return municipios.filter(pueblo => regex.test(pueblo));
  }

  handleAuxAddPuebloChange = (e, { newValue }) => {
    this.setState({
      auxAddPueblo: newValue
    });
  }

  handleOnSuggestionSelected = (c, suggestion) => {
    const { onSuggestionSelected } = this.props;
    onSuggestionSelected(c, { suggestion });
    this.setState({
        auxAddPueblo: ""
    });
  }

  render() {
    const { suggestionsPueblos } = this.state;
    const { hasError, disabled } = this.props;
    const classSuggestion = hasError
      ? "border border-danger form-control d-inline w-75"
      : "form-control d-inline w-100";
    const onChangeSuggestion = this.handleAuxAddPuebloChange;
    const auxAddPuebloValue = this.state.auxAddPueblo;
    const autoSuggestProps = {
      onChange: onChangeSuggestion,
      placeholder: "Introduce el pueblo...",
      value: auxAddPuebloValue,
      className: classSuggestion,
      disabled: disabled
    };
    const suggestionTheme = {
      container: "react-autosuggest__container",
      containerOpen: "react-autosuggest__container--open",
      input: "react-autosuggest__input",
      inputOpen: "react-autosuggest__input--open",
      inputFocused: "react-autosuggest__input--focused",
      suggestionsContainer: "list-group",
      suggestionsContainerOpen:
        "react-autosuggest__suggestions-container--open",
      suggestionsList: "list-group",
      suggestion: "list-group-item",
      suggestionFirst: "list-group-item",
      suggestionHighlighted: "bg-success text-light list-group-item",
      sectionContainer: "react-autosuggest__section-container",
      sectionContainerFirst: "react-autosuggest__section-container--first",
      sectionTitle: "react-autosuggest__section-title"
    };
    return (
      <AutoSuggest
        suggestions={suggestionsPueblos}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={(c, { suggestion }) => { this.handleOnSuggestionSelected(c, suggestion)}}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={autoSuggestProps}
        theme={suggestionTheme}
        id="txtAddPueblos"
      />
    );
  }
}

export default PueblosAutosuggest;
