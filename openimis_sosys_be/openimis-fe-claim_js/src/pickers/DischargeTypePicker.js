import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { DISCHARGE_TYPE } from "../constants";
class DischargeTypePicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="Discharge Type"
        constants={DISCHARGE_TYPE}
        {...this.props}
    />  
    } 
}

export default DischargeTypePicker;