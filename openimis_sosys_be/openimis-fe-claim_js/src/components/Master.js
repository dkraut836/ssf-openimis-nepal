import React, { Component, Fragment } from "react";
import _ from "lodash";
import _debounce from "lodash/debounce";
import EmployerDetail from './EmployerDetail';
// import BankInformation from './BankInformation';
class Master extends Component{
    

    render(){
        return(
            <React.Fragment>
                {/* <BankInformation {...this.props} edited={this.props.edited} onEditedChanged={this.props.onEditedChanged} /> */}
                <EmployerDetail {...this.props} edited={this.props.edited} onEditedChanged={this.props.onEditedChanged} />
            
            </React.Fragment>
        )
    }
}

export default Master;
    