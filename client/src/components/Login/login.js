 
import React, { Component } from 'react';
import './login.css';
// import { ReCaptcha } from 'react-recaptcha-google';
// import { loadReCaptcha } from 'react-recaptcha-google';
import InputField from '../SubComponents/InputField/inputField'
import validateEmail from '../../validateEmail';
import postRequest from '../../postReqest';
import PhoneInput from 'react-phone-number-input'

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        email: '',
        password: '',
        recaptchaToken: '',
        popupClass: 'hiddenOverlay',
        recoveryEmail: '',
        // phoneNumber: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    // this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.sendRecovery = this.sendRecovery.bind(this);
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
    // if (name === "recoveryEmail") this.setState({ phoneNumber: undefined})
  }
  togglePopup(){
    let newClass = "hiddenOverlay";
    if(this.state.popupClass === "hiddenOverlay") newClass = "overlay";
    this.setState({popupClass: newClass})
  }
  componentWillMount() {
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
    const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
    if(loggedInKey && email) {
      window.location.pathname = '/Home';
      alert("You are already logged in!")
    }
  //   loadReCaptcha()
  //   if (this.captchaDemo) {
  //       this.captchaDemo.reset();
  //       this.captchaDemo.execute();
  //   }
  // }
  // onLoadRecaptcha() {
  //     if (this.captchaDemo) {
  //         this.captchaDemo.reset();
  //         this.captchaDemo.execute();
  //     }
  // }
  // verifyCallback(recaptchaToken) {
  //   this.setState({recaptchaToken: recaptchaToken})
  }
  async sendRecovery(){
    if (validateEmail(this.state.recoveryEmail) === false && this.state.phoneNumber === "") return alert("You need to enter a valid email or phone number")
    if (this.state.recoveryEmail === "" && this.state.phoneNumber === "") return alert("You need to enter a valid email or phone number")
    const data = {
      recoveryEmail: this.state.recoveryEmail,
      // phoneNumber: this.state.phoneNumber
    }
    const url = `/api/recoverAccount`
    const json = await postRequest(url, data)
    if (json && json.success === true) alert("Your recovery message has been sent! Please enter it in the next prompt.")
    else alert("Something went wrong, please try again.")
    // this.togglePopup();
  }
  async handleSubmit(e){
    e.preventDefault();
    if (this.state.email === '') return alert("You need to enter a valid email")
    if (validateEmail(this.state.email) === false) return alert("You need to enter a valid email")
    if (this.state.password === '') return alert("You need to enter a password")
    const data = {
      email: this.state.email,
      password: this.state.password,
      // recaptchaToken: this.state.recaptchaToken
    }
    const url = `/api/signin`
    const json = await postRequest(url, data)
    if (json && json.loggedInKey){
      this.props.parentMethod(json && json.loggedInKey, this.state.email, json.couponsCurrentlyClaimed, json.membershipExperationDate);
      sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      // if(json.loggedInKey.substr(-1) === "c") {
      //   sessionStorage.setItem('UnlimitedCouponerMembershipExperationDate', json.membershipExperationDate)
      //   sessionStorage.setItem('UnlimitedCouponerCouponsCurrentlyClaimed', json.couponsCurrentlyClaimed)
      // }
    } else alert("Invalid Login")
  }
    
  render() {
    return (
      <div className="loginForm">
          <form className="form" method="post">
            <h2>Log In</h2>
            <div className="inputGroup">
              <div className="emailPass">
                  <label htmlFor="emailSignin">Email</label>
                  <input type="email" name="email" id="emailSignin" onChange={this.handleChange}/>
                  <br/>
                  <label htmlFor="passwordSignin">Password</label>
                  <input type="password" name="password" id="passwordSignin" onChange={this.handleChange}/>
                  <br/>
                <button className='signupbtn signupbtnn' value="send" onClick={this.handleSubmit}><strong>Sign In</strong></button>
                <div className='forgotPass'>
                  <strong onClick={this.togglePopup}>Forgot Password?</strong>
                </div>
              </div>
            </div>
          </form>
          <div className={this.state.popupClass}>
            <div className="popup">
              <h2 className="popupheader">Please Enter Your Email</h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent">
                <InputField
                htmlFor="Recover account"
                type="text"
                name="recoveryEmail"
                labelHTML="Your Email"
                placeholder="helpme@ohno.com"
                onChange={this.handleChange}
                required
                />
                <br/>
                {/* <PhoneInput
                  placeholder="Enter phone number"
                  value={ this.state.phoneNumber }
                  onChange={ phoneNumber => this.setState({ recoveryEmail: undefined, phoneNumber: phoneNumber}) } 
                /> */}
              <div className="popupbtn">
              <button className='signupbtn signupbtnn' value="send" onClick={this.sendRecovery}><strong>Recover</strong></button>
              </div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default Login;