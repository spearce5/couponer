 
import React, { Component } from 'react';
import './myCoupons.css';
import postRequest from '../../postReqest';
import CouponsMaker from '../../couponsMaker';

class MyCoupons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        geolocation: '',
        latitude: '',
        longitude: '',
        coupons: <div className="loaderContainer"><div className="loader"></div></div>
    };
    // this.getCoupons = this.getCoupons.bind(this);
  }
  async componentDidMount () {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
    const that = this;
    const google = window.google
    // eslint-disable-next-line
    const geocoder = new google.maps.Geocoder;
    function showPosition(position) {
      that.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      sessionStorage.setItem('couponlatitude', position.coords.latitude);
      sessionStorage.setItem('couponlongitude', position.coords.longitude);
    }
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
    const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
    if (!loggedInKey || loggedInKey.slice(-1) !== "b" && loggedInKey.slice(-1) !== "c") {
      window.history.pushState(null, '', '/Home');
      alert('You are not logged in!')
    }
    else {
      const data = {
        loggedInKey: loggedInKey,
        email: email
      }
      const url = `/api/getYourCoupons`
      const json = await postRequest(url, data)
      if(json.coupons) this.setState({coupons: CouponsMaker(json.coupons)})
      else this.setState({coupons: <div className="center"><br/><h2>No coupons found, claim some coupons today!</h2></div>})
    }
  }
  // async getCoupons(id) {
  //   this.props.parentMethod(id)
  // }
  render() {
    return (
      <div>
          <h2 className="center">Here are your coupons</h2>
          {this.state.coupons}
      </div>
    );
  }
}

export default MyCoupons;