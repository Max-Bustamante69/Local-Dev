import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import orthofixEcAssets from "@salesforce/resourceUrl/orthofixEcAssets";
import login from '@salesforce/apex/OrthofixEcLoginController.login';


export default class OrthofixEcLogin extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference)
    pageRef;

    orthofixLogoUrl = orthofixEcAssets + "/imgs/orthofix-logo.svg";
    orthofixBannerUrl = orthofixEcAssets + "/imgs/orthofix-login-banner.png";

    username;
    password;
    errorMsg = '';
    loader = false;

    get getBannerStl() {
        return `background-image:url("${this.orthofixBannerUrl}")`;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }

    handleUsernameChange(event) {
        this.username = event.target.value;
    }

    handleEnter(event) {
        if(event.keyCode === 13){
            this.handleLogin(event);
        }
    }

    handleLogin(event) {

        if (this.username && this.password) {
            event.preventDefault();

            this.showLoader();
            login({ username: this.username, password: this.password })
                .then((result) => {
                    console.log(result);
                    if (this.isValidURL(result)) {
                        window.location.href = result;
                    }else{
                        this.errorMsg = result;
                    }
                    this.hideLoader();
                })
                .catch((error) => {
                    console.log(error);
                    this.errorMsg = 'Error while authentication. Please contact support.';
                    this.hideLoader();
                });
        } else {
            alert('please provide username passowrd.');
        }
    }

    showLoader() {
        this.loader = true;
    }

    hideLoader() {
        this.loader = false;
    }

    isValidURL(url) {
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
        return urlPattern.test(url);
    }

    handleForgotPassword(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'ForgotPassword'
            }
        });
    }

}