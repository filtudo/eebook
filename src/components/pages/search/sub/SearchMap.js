import React, {Component} from 'react'
import EEMap, {planeSVGFR, targetSVG, planeSVGLines, selectedExtra} from '../../../common/EEMap'
import { connect } from 'react-redux'
import { map, uniqBy, filter, find } from 'lodash'
import {
  selectOrigin,
  selectDestin
} from '../../../../reducers/Search'



class SearchMap extends Component {

  constructor(props){
    super(props)

    this.clear()

  }

  clear(){
    this.cities = []
    this.lines = []
    this.linkToObject = null
  }

  processData(){
    this.clear()

    //in case we have both origin and destination selected
    if( this.props.originCode && this.props.destinCode){
      this.setOriginAndDestination()
    } else {
      this.getOriginsOrDestin()
      if(this.props.originCode || this.props.destinCode){
        this.setSelectedCityData()
      }
    }

    this.setMapTexts();
  }

  setMapTexts(){

    let origin = this.getSingleCityData('origin')
    let destin = this.getSingleCityData('destin')
    let message =  `Please select a an airport from below`;

    if( origin && destin){
      message = `You are flying from ${origin.title} to ${destin.title} ${this.props.oneWay ? '' : ' and back'}`
    } else if(origin) {
      message = `Available flights from ${origin.title}`
    } else if(destin) {
      message = `Available flights from ${destin.title}`
    }

    this.cities.push({
        label: message,
        svgPath: planeSVGFR,
        left: 100,
        top: 45,
        color: "#CC0000",
        labelColor: "#CC0000",
        labelRollOverColor: "#CC0000",
        labelFontSize: 20
    })

  }

  setOriginAndDestination(){

    let origin = this.getSingleCityData('origin')

    let destin = this.getSingleCityData('destin')

    this.cities.push(origin)
    this.cities.push(destin)
    this.cities.push({
        svgPath: planeSVGLines,
        positionOnLine: 0,
        color: "#585869",
        animateAlongLine: true,
        lineId: "line1",
        flipDirection: !this.props.oneWay,
        loop: true,
        scale: 0.03,
        positionScale: 1.8
    })

    this.lines.push({
      id: "line1",
      arc: -0.85,
      alpha: 0.3,
      latitudes: [origin.latitude, destin.latitude],
      longitudes: [origin.longitude, destin.longitude]
    })
  }

  onCityClick(event){
    const cityCode = event.mapObject.id;

    if( this.props.originCode === cityCode){
      this.props.dispatch(selectOrigin(''))
    } else if( this.props.destinCode === cityCode){
      this.props.dispatch(selectDestin(''))
    } else if((!this.props.originCode && !this.props.destinCode) || (!this.props.originCode && this.props.destinCode)){
      this.props.dispatch(selectOrigin(cityCode))
    } else {
      this.props.dispatch(selectDestin(cityCode))
    }

  }

  getSingleCityData( type = 'origin'){

    let cityData = [];

    if( type == 'origin' && this.props.originCode){
      cityData =  _.find(this.props.options, (x) => { return x.originCode == this.props.originCode })
      return {
        id: cityData.originCode,
        title: cityData.originName,
        latitude: cityData.originLat,
        longitude: cityData.originLon,
        svgPath: targetSVG,
        selectable: true,
        ...selectedExtra
      }
    } else if(type == 'destin' && this.props.destinCode){
      cityData =  _.find(this.props.options, (x) => { return x.destinationCode == this.props.destinCode })
      return {
        id: cityData.destinationCode,
        title: cityData.destinationName,
        latitude: cityData.destinLat,
        longitude: cityData.destinLon,
        svgPath: targetSVG,
        selectable: true,
        ...selectedExtra
      }
    }

    return false;

  }

  getOriginsOrDestin() {
    let cities = this.props.options;

    if (this.props.destinCode !== "") {
      cities = filter(cities, {destinationCode: this.props.destinCode});
    }else if (this.props.originCode !== "") {
      cities = filter(cities, {originCode: this.props.originCode});
    }

     cities = map(cities, (itm) => {
      if( this.props.destinCode || ( !this.props.destinCode && !this.props.originCode)){
        return {
          title: itm.originName,
          id: itm.originCode,
          svgPath: targetSVG,
          latitude: itm.originLat,
          longitude: itm.originLon,
          selectable: true
        };
      } else {
        return {
          title: itm.destinationName,
          id: itm.destinationCode,
          svgPath: targetSVG,
          latitude: itm.destinLat,
          longitude: itm.destinLon,
          selectable: true
        };
      }

    });

    this.cities = uniqBy(cities, 'id');
  }

  setSelectedCityData(){
    let selectedCity
    if( this.props.destinCode){
      selectedCity = this.getSingleCityData( 'destin')
    } else {
      selectedCity = this.getSingleCityData( 'origin')
    }

    this.lines = map(this.cities, (city) => {
      return {
        latitudes: [selectedCity.latitude, city.latitude],
        longitudes: [selectedCity.longitude, city.longitude]
      }
    })

    this.cities.push(selectedCity);
    this.linkToObject = selectedCity;
  }

  render(){
    this.processData()
    if(this.cities){
        return( <EEMap cities={this.cities} lines={this.lines} linkToObject={this.linkToObject} onCityClick={this.onCityClick.bind(this)} />)
    }

  }
}

function getProperties(state) {
    return {
        originCode: state.Search.originCode,
        destinCode: state.Search.destinCode,
        oneWay: (state.Search.numJourneys == 2) ? false : true,
        options:    state.Data.routes,
    }
}

export default connect(getProperties)(SearchMap);
