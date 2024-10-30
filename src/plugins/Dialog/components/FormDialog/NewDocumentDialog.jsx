import React from "react";
import PropTypes from "prop-types";
import useNewDocument from "./hooks/useNewDocument";
import FormDialog from "./FormDialog";

const NewDocumentDialog = (props) => {
  const {
    call,
    title = "New",
    submitText = "Submit",
    placeholder,
    scope,
    onSubmit,
    onClose,
    loadingMessage,
  } = props;
  const { onValidation, onPostValidation } = useNewDocument({ scope, call });

  return (
    <FormDialog
      title={title}
      scope={scope}
      loadingMessage={loadingMessage}
      submitText={submitText}
      placeholder={placeholder}
      onSubmit={onSubmit}
      onClose={onClose}
      onValidation={onValidation}
      onPostValidation={onPostValidation}
    />
  );
};

NewDocumentDialog.propTypes = {
  call: PropTypes.func.isRequired,
  scope: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loadingMessage: PropTypes.string,
  submitText: PropTypes.string,
  placeholder: PropTypes.string,
  title: PropTypes.string,
};

export default NewDocumentDialog;
