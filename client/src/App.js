import React, { Component } from 'react';
import './App.css';
import CouponForm from './components/CouponForm/couponform';
import SignUp from './components/SignUp/signup';
import AccountSettings from './components/AccountSettings/accountsettings';
import Home from './components/Home/home';
import Footer from './components/Footer/footer';
import Login from './components/Login/login';
import Search from './components/Search/search';
import About from './components/About/about';
import history from './history';
// import { loadReCaptcha } from 'react-recaptcha-google';
import MyCoupons from './components/MyCoupons/myCoupons';
import postRequest from './postReqest';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// For routing
const Link = props => {
    const onClick = e => {
        const aNewTab = e.metaKey || e.ctrlKey;
        const anExternalLink = props.href.startsWith('http');
        if (!aNewTab && !anExternalLink) {
            e.preventDefault();
            history.push(props.href);
        }
    };
    return (
      <div className="notHidden">
        <a href={props.href} onClick={onClick}>
            {props.children}
        </a>
      </div>
    );
};

class App extends Component {
  constructor(props) {
      super(props);
      this.state = { 
        mainContent: '',
        loginButton: 'notHidden',
        logoutButton: 'hidden',
        email: '',
        loggedInKey: '',
        couponsCurrentlyClaimed: 0,
        membershipExperationDate: '',
        showOrHideNav: 'hidden',
        loggedInBuisness: 'hidden',
        ignoreClick: true, // handles navbar closing when open and clicking outside it.
        couponData: <div className="loaderContainer"><div className="loader"></div></div>,
    };
    this.setMainSearch = this.setMainSearch.bind(this);
    this.setMainUploadCoupon = this.setMainUploadCoupon.bind(this);
    this.setMainSignUp = this.setMainSignUp.bind(this);
    this.setMainAccountSettings = this.setMainAccountSettings.bind(this);
    this.setMainHome = this.setMainHome.bind(this);
    this.setMainLogin = this.setMainLogin.bind(this);
    this.setStateLoggedIn = this.setStateLoggedIn.bind(this)
    this.logout = this.logout.bind(this);
    this.setMainToAbout = this.setMainToAbout.bind(this);
    this.showOrHideNav = this.showOrHideNav.bind(this);
    this.setMainToMyCoupons = this.setMainToMyCoupons.bind(this);
    this.uploadCoupons = this.uploadCoupons.bind(this);
    this.hideNav = this.hideNav.bind(this);
    this.updateAccountSettings = this.updateAccountSettings.bind(this);
    // this.fetchCoupons = this.fetchCoupons.bind(this);
    this.updateCouponsClaimed = this.updateCouponsClaimed.bind(this);
  }
  async componentDidMount () {
    const urlHandler = currentURL => {
      if(currentURL.toLowerCase().substring(0, 6) === "search") this.setMainSearch();
      else {
        switch (currentURL.toLowerCase()) {
          case 'home':
              this.setMainHome();
              break;
          case 'uploadcoupon':
              this.setMainUploadCoupon();
              break;
          case 'accountsettings':
              this.setMainAccountSettings();
              break;
          case 'signup':
              this.setMainSignUp();
              break;
          case 'login':
              this.setMainLogin();
              break;
          case 'about':
              this.setMainToAbout();
              break;
          case 'mycoupons':
              this.setMainToMyCoupons();
              break;
          default:
              window.location.pathname = '/Home';
              this.setMainHome();
              break;
        }
      }
    }
    const url = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
    urlHandler(url);
    this._isMounted = true;
    window.onpopstate = () => {
      if(this._isMounted) {
        const urlPath = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
        urlHandler(urlPath)
      }
    }
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey');
    const couponsCurrentlyClaimed = sessionStorage.getItem('couponsCurrentlyClaimed')
    const membershipExperationDate = sessionStorage.getItem('membershipExperationDate')
    if (loggedInKey) this.setState({loginButton: 'hidden', logoutButton: 'notHidden', loggedInKey: sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', ''), email:sessionStorage.getItem('UnlimitedCouponerEmail'), membershipExperationDate: membershipExperationDate, couponsCurrentlyClaimed: couponsCurrentlyClaimed })
    if (loggedInKey && loggedInKey.substr(-1) === "b") this.setState({loggedInBuisness: 'notHidden'})
  }

  showOrHideNav = () => {
    if (this.state.showOrHideNav === "navPopup") this.setState({showOrHideNav:"hidden", ignoreClick: true})
    else this.setState({showOrHideNav:"navPopup", ignoreClick: false})
  }
  hideNav = () => {
    if (this.showOrHideNav !== "hidden" && this.state.ignoreClick === false) this.setState({showOrHideNav: "hidden", ignoreClick: true})
  }
  async logout(){
    const data = {
      loggedInKey: this.state.loggedInKey,
      email: this.state.email
    }
    await postRequest(`/api/signout`, data)
    this.setState({mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed}/>, loggedInKey: '', email: '', loginButton: 'notHidden', logoutButton: 'hidden', loggedInBuisness:"hidden",couponsCurrentlyClaimed: '', couponsCurrentlyClaimed: '',})
    sessionStorage.removeItem('UnlimitedCouponerKey')
    sessionStorage.removeItem('UnlimitedCouponerEmail')
    sessionStorage.removeItem('buisnessOwner');
    sessionStorage.removeItem('couponsCurrentlyClaimed')
    sessionStorage.removeItem('membershipExperationDate')
  }
  async uploadCoupons(state){
    const data = {
      description: state.description,
      source: state.source,
      currency: state.currency,
      amount: state.amount,
      title: state.title,
      longitude: state.longitude,
      latitude: state.latitude,
      address: state.address,
      amountCoupons: state.amountCoupons,
      currentPrice: state.currentPrice,
      discountedPrice: state.discountedPrice,
      superCoupon: state.superCoupon,
      textarea: state.textarea,
      imagePreviewUrl: state.imagePreviewUrl,
      category: state.category,
      city: state.city,
      zip: state.zip,
      loggedInKey: this.state.loggedInKey,
      email: this.state.email,
    }
    const json = await postRequest(`/api/uploadCoupons`, data)
    //!todo, check json
    toast.success("Coupon Created!")
    // alert(JSON.stringify(json), "json")
  }
  async updateAccountSettings(data){
    const dataObject = {
      oldPassword: data.oldPassword,
      newPassword:  data.newPassword,
      city: data.city,
      businessName: data.businessName,
      loggedInKey: this.state.loggedInKey,
      email: this.state.email
    }
    const json = await postRequest(`/api/updateAccount`, dataObject)
    if(json && json.response === "Updated Account!") toast.success("Updated Account!")
    else toast.error("Failed to update account.")
  }
  setMainAccountSettings = () => this.setState({mainContent: <AccountSettings setMainHome={this.setMainHome} updateAccountSettings={this.updateAccountSettings} updateCouponsClaimed={this.updateCouponsClaimed}/>})
  
  setMainUploadCoupon = () => this.setState({mainContent: <CouponForm setMainHome={this.setMainHome} uploadCoupons={this.uploadCoupons}/>})
  
  setMainSignUp = () => this.setState({mainContent: <SignUp setMainHome={this.setMainHome} parentMethod={this.setStateLoggedIn}/>})
  
  updateCouponsClaimed = number => number === -1 ? this.setState({couponsCurrentlyClaimed: (Number(this.state.couponsCurrentlyClaimed) - 1)}) : this.setState({couponsCurrentlyClaimed: (Number(this.state.couponsCurrentlyClaimed) + 1)})

  setMainHome = () => this.setState({mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed}/>})

  setMainLogin = () => this.setState({mainContent: <Login setMainHome={this.setMainHome} parentMethod={this.setStateLoggedIn}/>})
  
  setMainSearch = () => this.setState({mainContent: <Search updateCouponsClaimed={this.updateCouponsClaimed}/>})

  setMainToAbout = () => this.setState({mainContent: <About/>})

  setMainToMyCoupons = () => this.setState({mainContent: <MyCoupons setMainHome={this.setMainHome}/>})
  
  setStateLoggedIn = (key, email, couponsCurrentlyClaimed, membershipExperationDate) => {
    sessionStorage.setItem('UnlimitedCouponerKey', key)
    sessionStorage.setItem('UnlimitedCouponerEmail', email)
    if(key.substr(-1) === "c") {
      sessionStorage.setItem('buisnessOwner', "false");
      this.setState({mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed}/>, loggedInKey: key, email: email, logoutButton: 'notHidden', loginButton: 'hidden', couponsCurrentlyClaimed: couponsCurrentlyClaimed, membershipExperationDate: membershipExperationDate})
      sessionStorage.setItem('couponsCurrentlyClaimed', couponsCurrentlyClaimed)
      sessionStorage.setItem('membershipExperationDate', membershipExperationDate)
      window.history.pushState(null, '', '/Home');
    }
    else if(key.substr(-1) === "b") {
      sessionStorage.setItem('buisnessOwner', "true");
      this.setState({mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed}/>, loggedInKey: key, email: email, logoutButton: 'notHidden', loginButton: 'hidden', loggedInBuisness: 'notHidden'})
      window.history.pushState(null, '', '/Home');
    }
  }
  render () {
    return (
        <div className="home" onClick={this.hideNav}>
        <ToastContainer />
          <h1 className='homeMainTitle'>
            <span>
              Save money, grow your business, try something new.
            </span>
          </h1>
          {
            (this.state.loggedInKey !== "") ? <p>loggedInKey: {this.state.loggedInKey}</p> : <p></p>
          }
          {
            (this.state.email !== "") ? <strong><p>Logged in as: {this.state.email}.</p></strong> :
            <strong><p>Welcome, Guest!</p></strong>
          }
          {
            (this.state.couponsCurrentlyClaimed && this.state.couponsCurrentlyClaimed !== "" && this.state.membershipExperationDate && this.state.membershipExperationDate !== "" ) ?
            <strong><p>Currently Claimed Coupons: {(this.state.couponsCurrentlyClaimed !== "undefined" && this.state.couponsCurrentlyClaimed !== "NaN" && this.state.couponsCurrentlyClaimed !=='N/A') ? this.state.couponsCurrentlyClaimed + '/5' : 0 + '/5'}</p>
            <p>Membership Experation Date: {this.state.membershipExperationDate.substring(0, this.state.membershipExperationDate.indexOf('T'))}</p></strong> :
            <p></p>
          }
        <header className='homeHeader'>
          <section>
            <a href="/Home" onClick={this.setMainHome} id="logo">
              <strong>
                UnlimitedCouponer
              </strong>
            </a>
            <span htmlFor="toggle-1" className="toggle-menu" onClick={this.showOrHideNav}>
              <ul>
                <li ></li>
                <li ></li>
                <li ></li>
              </ul>
            </span>
            {/* <input type="checkbox" id="toggle-1" onClick={this.showOrHideNav}/> */}
          <nav className = {this.state.showOrHideNav} onClick={this.showOrHideNav}>
            <ul>
              <Link href = '/Home'><li onClick={this.setMainHome}><div><i className="icon-home"></i>Home</div></li></Link>
              <Link href = '/About'><li onClick={this.setMainToAbout}><div><i className="fa fa-info-circle"></i>About</div></li></Link>
              <div className={this.state.loginButton}><Link href = '/Login'><li onClick={this.setMainLogin}><div><i className="icon-signin"></i>Login</div></li></Link></div>
              <div className={this.state.loginButton}><Link href = '/SignUp'><li onClick={this.setMainSignUp}><div><i className="icon-user"></i>Sign up</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/Home'><li onClick={this.logout}><div><i className="icon-user"></i>Logout</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/MyCoupons'><li onClick={this.setMainToMyCoupons}><div><i className="icon-money"></i>My Coupons</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/AccountSettings'><li onClick={this.setMainAccountSettings}><div><i className="icon-gear"></i>Account Settings</div></li></Link></div>
              <div className={this.state.loggedInBuisness}><Link href = '/UploadCoupon'><li onClick={this.setMainUploadCoupon}><div><i className="icon-money"></i>Upload Coupons</div></li></Link></div>
              <Link href = '/Search'><li onClick={this.setMainSearch}><div><i className="icon-search"></i>Search Coupons</div></li></Link>
            </ul>
          </nav>
          </section>
        </header>
          {this.state.mainContent}
          <br/>
          <br/>
          {/* {this.state.signinSignoutButton}
          {this.state.signupButton} */}
        <Footer/>
        </div>
    )
  }
}

export default App;
