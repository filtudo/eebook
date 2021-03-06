import './Search.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Button               from '../../common/Button'
import AirportSearchInput   from './sub/AirportSearchInput'
import DatePicker           from './sub/DatePicker'
import PaxNumSpinner        from './sub/PaxNumSpinner'

import { map, uniqBy, filter } from 'lodash'
import {
  selectOrigin,
  selectDestin,
  toggleReturn,
  selectReturnDate,
  setPaxNum,
  resetSearch
} from '../../../reducers/Search'

import {retrieveRoutes} from '../../../reducers/Data';

import Dropdown from '../../common/Dropdown'

class Form extends Component {

  componentDidMount() {
    if (!this.props.options || this.props.options.length < 1) {
      this.props.dispatch(retrieveRoutes());
    }
  }

  onChangeDate( dateSelector) {
    dateSelector = this.props.menu ? null : dateSelector;
    this.props.dispatch({ type: 'OPEN_SIDE_MENU', payload: dateSelector });
  }

  onOriginSelected(itm) {
    this.props.dispatch(selectOrigin(itm.value));
  }

  onDestinSelected(itm) {
    this.props.dispatch(selectDestin(itm.value));
  }

  onToggleReturn() {
    this.props.dispatch(selectReturnDate(null));
    this.props.dispatch(toggleReturn());
  }

  getOrigins() {
    let options = this.props.options;

    if (this.props.destinCode !== "") {
      options = filter(options, {destinationCode: this.props.destinCode});
    }

    let origins = map(options, (itm) => {
      return {
        label: itm.originName,
        value: itm.originCode
      };
    });

    origins = uniqBy(origins, 'value');
    return origins;
  }

  getDestinations() {
    let options = this.props.options;

    if (this.props.originCode !== "") {
      options = filter(options, {originCode: this.props.originCode});
    }

    let destins = map(options, itm => {
      return {
        label: itm.destinationName,
        value: itm.destinationCode
      }
    });

    destins = uniqBy(destins, 'value');
    return destins;
  }

  onPaxNumberChange( paxType, operation){
    this.props.dispatch(setPaxNum(paxType, operation));
  }

  clearOrigin() {
    this.props.dispatch(selectOrigin(""));
  }

  clearDestin() {
    this.props.dispatch(selectDestin(""));
  }

  onResetSearch(){
    this.props.dispatch(resetSearch(""));
  }

  render() {
    // console.log("Form::render", this.props.options);
    // const options = [
    //   {label:"One",   value:"1"},
    //   {label:"Two",   value:"2"},
    //   {label:"Three", value:"3"},
    // ];

        // <fieldset>
        //   <Dropdown
        //     label="First"
        //     options={this.props.options}/>
        // </fieldset>

    return (
      <form className={"search " + this.props.className}>
        <h3>Flight Booking</h3>

        <fieldset>
          <legend className="sr-only">Airports</legend>
          <AirportSearchInput
            label="From"
            error={this.props.error}
            onInput={this.clearOrigin.bind(this)}
            onOptionSelected={this.onOriginSelected.bind(this)}
            options={this.getOrigins()}
          />
          <AirportSearchInput
            label="To"
            error={this.props.error}
            onInput={this.clearDestin.bind(this)}
            onOptionSelected={this.onDestinSelected.bind(this)}
            options={this.getDestinations()}
          />
        </fieldset>

        <fieldset className="row dates compact">
          <legend className="sr-only">Dates</legend>
          <div  className="col-xs-6">
            <DatePicker label="Depart"
              onChangeDate={this.onChangeDate.bind(this, 'departureDate')}
              date={this.props.departureDate}
              />
          </div>
          <div  className="col-xs-6">
            <DatePicker
              label="Return on"
              disabled={this.props.isOneWay}
              toggleDisabled={this.onToggleReturn.bind(this)}
              date={this.props.returnDate}
              onChangeDate={this.onChangeDate.bind(this, 'returnDate')}
            />
          </div>
        </fieldset>

        <fieldset className="row paxes compact">
          <legend className="sr-only">Passengers</legend>
          <div  className="col-xs-4">
            <PaxNumSpinner label="Adults" paxType="numAdt" minNum={1} maxNum={this.props.passengers.maxAdults} from={12} unit="years" num={this.props.numAdt} onPaxNumberChange={this.onPaxNumberChange.bind(this)}/>
          </div>
          <div  className="col-xs-4">
            <PaxNumSpinner label="Children" paxType="numChd" minNum={0} maxNum={this.props.passengers.maxChildren} from={2} to={12} unit="years" num={this.props.numChd} onPaxNumberChange={this.onPaxNumberChange.bind(this)}/>
          </div>
          <div  className="col-xs-4">
            <PaxNumSpinner label="Infants" paxType="numInf" minNum={0} maxNum={this.props.passengers.maxInfants} from={0} to={23} unit="months" num={this.props.numInf} onPaxNumberChange={this.onPaxNumberChange.bind(this)}/>
          </div>
        </fieldset>

        <fieldset className="row actions compact">
          <legend className="sr-only">Actions</legend>
          <div  className="col-xs-6">
            <Button className="default block" onClick={this.onResetSearch.bind(this)}>
              <i className="glyphicon glyphicon-repeat"></i>
              <span className="btn--text">Reset</span>
            </Button>
          </div>
          <div  className="col-xs-6">
            <Button className="primary block">
              <i className="glyphicon glyphicon-search"></i>
              <span className="btn--text">Search</span>
            </Button>
          </div>
        </fieldset>
      </form>
    );
  }
}

Form.defaultProps = {
  className: ""
};

function getProperties(state) {
  const st = state.Search;
  return {
    originCode: st.originCode,
    destinCode: st.destinCode,
    options:    state.Data.routes,
    passengers:    state.Data.passengers,
    dates:    state.Data.dates,
    error:      st.error,
    isOneWay:   st.numJourneys < 2,
    departureDate: st.departureDate,
    returnDate: st.returnDate,
    numAdt: st.numAdt,
    numChd: st.numChd,
    numInf: st.numInf,
    menu: state.Layout.menu
  };
}

export default connect(getProperties)(Form);
