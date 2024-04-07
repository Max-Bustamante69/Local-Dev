import {LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';


class OrthofixNotificationUtility extends LightningElement {

    static showSuccess(page, title, message){
        OrthofixNotificationUtility.showNotification(page, title, message, 'success');
    }

    static showWarning(page, title, message){
        OrthofixNotificationUtility.showNotification(page, title, message, 'warning');
    }

    static showError(page, title, message){
        OrthofixNotificationUtility.showNotification(page, title, message, 'error');
    }

    static showInfo(page, title, message){
        OrthofixNotificationUtility.showNotification(page, title, message, 'info');
    }

    static showReduceErrors(page, errors){
        let message = OrthofixNotificationUtility.reduceErrors(errors);
        if(Array.isArray(message)){
            message = message.join('<br/> ');
        }
        OrthofixNotificationUtility.showNotification(page, 'Error', message, 'error');
    }

    static showNotification(page, title, message, variant){
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode:'dismissible'
        });
        page.dispatchEvent(evt);
    }

    /**
     * Reduces one or more LDS errors into a string[] of error messages.
     * @param {FetchResponse|FetchResponse[]} errors
     * @return {String[]} Error messages
     */
    static reduceErrors(errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }

        return (
            errors
                // Remove null/undefined items
                .filter((error) => !!error)
                // Extract an error message
                .map((error) => {
                    // UI API read errors
                    if (Array.isArray(error.body)) {
                        return error.body.map((e) => e.message);
                    }
                    // Page level errors
                    else if (
                        error?.body?.pageErrors &&
                        error.body.pageErrors.length > 0
                    ) {
                        return error.body.pageErrors.map((e) => e.message);
                    }
                    // Field level errors
                    else if (
                        error?.body?.fieldErrors &&
                        Object.keys(error.body.fieldErrors).length > 0
                    ) {
                        const fieldErrors = [];
                        Object.values(error.body.fieldErrors).forEach(
                            (errorArray) => {
                                fieldErrors.push(
                                    ...errorArray.map((e) => e.message)
                                );
                            }
                        );
                        return fieldErrors;
                    }
                    // UI API DML page level errors
                    else if (
                        error?.body?.output?.errors &&
                        error.body.output.errors.length > 0
                    ) {
                        return error.body.output.errors.map((e) => e.message);
                    }
                    // UI API DML field level errors
                    else if (
                        error?.body?.output?.fieldErrors &&
                        Object.keys(error.body.output.fieldErrors).length > 0
                    ) {
                        const fieldErrors = [];
                        Object.values(error.body.output.fieldErrors).forEach(
                            (errorArray) => {
                                fieldErrors.push(
                                    ...errorArray.map((e) => e.message)
                                );
                            }
                        );
                        return fieldErrors;
                    }
                    // UI API DML, Apex and network errors
                    else if (error.body && typeof error.body.message === 'string') {
                        return error.body.message;
                    }
                    // JS errors
                    else if (typeof error.message === 'string') {
                        return error.message;
                    }
                    // Unknown error shape so try HTTP status text
                    return error.statusText;
                })
                // Flatten
                .reduce((prev, curr) => prev.concat(curr), [])
                // Remove empty strings
                .filter((message) => !!message)
        );
    }

    static confirmeRemove(callback, title){
        return LightningConfirm.open({
            message: title,
            variant: 'header',
            label: 'Please Confirm',
            theme: 'alt-inverse',
        }).then(function(result) {
            if(result){
                callback();
            }
        });
    }

    static showLoader(page){
        page.dispatchEvent(new CustomEvent('showloader',{bubbles : true, composed : true}));
    }

    static hideLoader(page){
        page.dispatchEvent(new CustomEvent('hideloader',{bubbles : true, composed : true}));
    }

}

const showSuccess = (page, title, message) => {
    OrthofixNotificationUtility.showSuccess(page, title, message);
};
const showWarning = (page, title, message) => {
    OrthofixNotificationUtility.showWarning(page, title, message);
};
const showError = (page, title, message) => {
    OrthofixNotificationUtility.showError(page, title, message);
};
const showInfo = (page, title, message) => {
    OrthofixNotificationUtility.showInfo(page, title, message);
};
const showReduceErrors = (page, error) => {
    OrthofixNotificationUtility.showReduceErrors(page, error);
};
const confirmeRemove = (callback, title) => {
    if(!title){
        title='Are you sure you want to delete?';
    }
    OrthofixNotificationUtility.confirmeRemove(callback, title);
};
const showLoader = (page) => {
    OrthofixNotificationUtility.showLoader(page);
};
const hideLoader = (page) => {
    OrthofixNotificationUtility.hideLoader(page);
};
const reduceErrors = (errors) => {
    return OrthofixNotificationUtility.reduceErrors(errors);
};

export {
    showSuccess,
    showWarning,
    showError,
    showInfo,
    showReduceErrors,
    confirmeRemove,
    showLoader,
    hideLoader,
    reduceErrors
}