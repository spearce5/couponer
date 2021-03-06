import React, { Component } from 'react';
import './signup.css';
import PhoneInput from 'react-phone-number-input'
import 'react-flags-select/css/react-flags-select.css';
import 'react-phone-number-input/style.css'
import InputField from '../SubComponents/InputField/inputField'
import Checkout from '../Checkout/checkout';
import validateEmail from '../../validateEmail';
import postRequest from '../../postReqest';
import { toast } from 'react-toastify';


// Checkout button is clicked
// Check if info inputted is valid                 // if failed break
// Check number by sending twilio sms 5 digit code // if Xed out then break. Allow retries
// If number is valid save result unless number changes
// Attempt credit card checkout

class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customerOrBuisness: [
        ' Customer',
        ' Buisness Owner',
      ],
      email: '',
      password: '',
      passwordConfirm: '',
      city: '',
      buisnessName: '',
      yourPick: '',
      showOrHideBuisInput: 'hideBuissnessIfCustomer',
      showSignUp: 'hideBuissnessIfCustomer',
      showOrHideAccountMem: 'showBuissnessIfCustomer',
      recaptchaToken: '',
      membershipExperationDate: '',
      numberOfMonths: 0,
      fiveDigitCode: '',
      phoneNumber: '',
      popupClass: 'hiddenOverlay',
      boolValidPhoneNumber: false,
      validPhoneNumber: <span className="icon red">&#x2718;</span>,
      showOrHidePhoneValidationButton:'signupbtn',
      checkout: "hidden"
    }
    this.handleSingup = this.handleSingup.bind(this);
    this.updateMembershipExperationDate = this.updateMembershipExperationDate.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.validatePhone = this.validatePhone.bind(this);
    this.handleCustomerSignup = this.handleCustomerSignup.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
  }
  componentWillMount() {
    if(sessionStorage.getItem('UnlimitedCouponerEmail') && sessionStorage.getItem('UnlimitedCouponerKey')) {
      this.props.setMainHome()
      window.history.pushState(null, '', '/Home');
      toast.error("You are already logged in!")
    }
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  async validatePhoneNumber(){
    const data = {
      phoneNumber: this.state.phoneNumber,
      randomNumber: this.state.fiveDigitCode,
    }
    const json = await postRequest(`/api/phoneTestValidateNumber`, data)
    if (json && json.success) {
      toast.success("Phone number is valid, woohoo!")
      this.setState({checkout: "showBuissnessIfCustomer", showOrHidePhoneValidationButton: 'hidden', boolValidPhoneNumber: true, validPhoneNumber: <span className="green icon">&#10003;</span>})
      if (this.state.yourPick === " Buisness Owner") this.setState({showSignUp:"showBuissnessIfCustomer", checkout: "hidden"})
      this.togglePopup();
    }
    else toast.error("The number you have entered is incorrect")
  }
  updateMembershipExperationDate = event => {
    let d = new Date();
    d.setMonth( d.getMonth() + Number(event.target.value));
    this.setState({numberOfMonths: Number(event.target.value), membershipExperationDate: d})
  }
  async validatePhone(){
    if(this.state.phoneNumber[0] !== "+") {
      toast.error("You need to select the country your phone is registered in!")
      return false;
    }
    else {
      this.togglePopup()
      const data = {
        phoneNumber: this.state.phoneNumber,
      }
      await postRequest(`/api/phoneTest`, data)
    }
  }

  validState = state => state.phoneNumber[0] !== "+" && state.city && state.email && state.yourPick !== '' && state.password === state.passwordConfirm && state.phoneNumber && state.membershipExperationDate ? true : false;

  async handleSingup(e){
    if(this.state.boolValidPhoneNumber === false) return toast.error("You must validate your phone number!")
    e.preventDefault();
    const data = {
      buisnessName: this.state.buisnessName,
      city: this.state.city,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.phoneNumber,
      randomNumber: Number(this.state.fiveDigitCode)
    }
    if (validateEmail(this.state.email) && this.validState(this.state)){
      const json = await postRequest(`/api/signupCustomer`, data)
      if (json && json.loggedInKey) {
        this.props.parentMethod(json && json.loggedInKey, this.state.email);
        sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      }
    } else toast.error("There was an error with your submission!")
  }
  async handleCustomerSignup(dataFromStripe){
    const data = {
      city: this.state.city,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.phoneNumber,
      membershipExperationDate: this.state.membershipExperationDate,
      description: dataFromStripe.description,
      randomNumber: Number(this.state.fiveDigitCode),
      source: dataFromStripe.source,
      currency: dataFromStripe.currency,
      amount: dataFromStripe.amount,
    }
    if (validateEmail(this.state.email) && this.validState(this.state)){
      const json = await postRequest(`/api/signupCustomer`, data)
      if (json && json.loggedInKey) {
        this.props.parentMethod(json && json.loggedInKey, this.state.email, json.couponsCurrentlyClaimed, json.membershipExperationDate)
        sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      }
    } else toast.error("Your email is not valid!")
  }

  togglePopup = () => this.state.popupClass === "hiddenOverlay" ? this.setState({popupClass: "overlay"}) : this.setState({popupClass: "hiddenOverlay"})

  render() {
    const options = this.state.customerOrBuisness.map((loan, key) => {
      const isCurrent = this.state.yourPick === loan
      return (
        <div className='center_radio' id={key}>
            <label id={key}
              className={
                isCurrent ? 
                  'radioPad__wrapper radioPad__wrapper--selected' :
                  'radioPad__wrapper'
                }
            >
              <input
                className="radioPad__radio"
                type="radio" 
                name="customerOrBuisness" 
                id={loan} 
                value={loan}
                onChange={this.handleRadio}
              />
              <strong className='radioHTML'>{loan}</strong>
            </label>
            </div>
      )
    })
    return (
      <div className="container text-center">
        <section id="portfolio" className="content">
          <h2 className="textHeader">Sign up</h2>
          <p className="text">First, validate your phone number. UnlimitedCouponer needs your phone number in order to text you claimed coupons and to allow easy verification of coupons. Then if you are a customer, choose your membership plan. Membership will be needed to claim coupons and you can claim unlimited coupons so long as you actually use them! Business owners cannot claim coupons but do not have a membership fee.  </p>
        </section>
        <div className="row">
          <hr />
          <br/>
          {options}
        </div>
          <form className='signinForm'>
          <InputField
            htmlFor="Email"
            type="email"
            name="email"
            labelHTML="Email"
            placeholder="ProSaver@UnlimitedCouponer.com"
            onChange={this.handleChange}
            required
          />
          <InputField
            htmlFor="Password"
            type="password"
            name="password"
            labelHTML="Password"
            placeholder="Your Password Here"
            onChange={this.handleChange}
            required
          />
          <InputField
            htmlFor="Password"
            type="password"
            name="passwordConfirm"
            labelHTML="Confirm Password"
            placeholder="Confirm Password"
            onChange={this.handleChange}
            required
          />
          <InputField
            htmlFor="City"
            type="text"
            labelHTML="City"
            name="city"
            placeholder="Coupon Town"
            onChange={this.handleChange}
            required
          />
      <div className={this.state.showOrHideBuisInput}>
      <InputField
        htmlFor="Buisness Name"
        type="text"
        name="buisnessName"
        labelHTML="Buisness Name"
        placeholder="Bob's Kitten Rentals"
        onChange={this.handleChange}
      /> 
      </div>
      <div className={this.state.showOrHideAccountMem}>
        <InputField
          htmlFor="Subscription Length"
          type="text"
          labelHTML="Subscription Length"
          name="numberOfMonths"
          placeholder="Subscription Length 4.99$ per month for unlimited coupons"
          onChange={this.updateMembershipExperationDate}
        />
      </div>
  </form>
  <div className="phoneHolder">
    <PhoneInput
      placeholder="Enter phone number"
      value={ this.state.phoneNumber }
      onChange={ phoneNumber => this.setState({ phoneNumber: phoneNumber, validPhoneNumber: <span className="icon red">&#x2718;</span>, showOrHidePhoneValidationButton: "signupbtn"}) } 
    />
    <div className="phoneImage">{this.state.validPhoneNumber}</div>
  </div>
  <div className='buttonAndForgot'>
    <button type="submit" value="Submit" className={this.state.showOrHidePhoneValidationButton} onClick={this.validatePhone}><strong>Validate Phone Number</strong></button>
    <div className={this.state.popupClass}>
            <div className="popup">
              <h2 className="popupheader">Please Enter Your 5 digit security code</h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent fivedigit">
              <InputField
                htmlFor="5 digit code"
                type="number"
                labelHTML="5 digit code"
                placeholder="12345"
                name="fiveDigitCode"
                onChange={this.handleChange}
                required
              />
              <div className="popupbtn">
              <button className='signupbtn signupbtnn' value="send" onClick={this.validatePhoneNumber}><strong>Submit</strong></button>
              </div>
              </div>
            </div>
          </div>
    <div className={this.state.checkout}>
    <div className="center">
      <Checkout
        parentMethod = {this.handleCustomerSignup}
        name={'UnlimitedCouponer Membership'}
        description={this.state.numberOfMonths + ' Month(s) of Unlimted Coupons'}
        amount={this.state.numberOfMonths * 4.99}
        panelLabel="Get membership"
      />
    </div>
      <br/>
      <br/>
    </div>
    <div className={this.state.showSignUp}>
      <button type="submit" value="Submit" className="signupbtn" onClick={this.handleSingup}><strong>Sign up!</strong></button>
    </div>
    </div>
    </div>
    )
  }
  handleRadio(e) {
    if (e.target.value === ' Customer') {
      if(this.state.boolValidPhoneNumber === true) this.setState({checkout:"showBuissnessIfCustomer"})
      this.setState({
        yourPick: e.target.value,
        showOrHideBuisInput: 'hideBuissnessIfCustomer',
        showOrHideAccountMem: 'showBuissnessIfCustomer',
        showSignUp:'hideBuissnessIfCustomer'
      })
    }
    else if(e.target.value === ' Buisness Owner') {
      if (this.state.boolValidPhoneNumber) this.setState({showSignUp:'showBuissnessIfCustomer'})
      this.setState({
        yourPick: e.target.value,
        showOrHideBuisInput: 'showBuissnessIfCustomer',
        showOrHideAccountMem: 'hideBuissnessIfCustomer',
        checkout: "hidden"
      })
    }
  }
}

export default SignUp;
