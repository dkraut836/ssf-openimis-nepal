import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { CLAIM_TYPE } from "../constants";
class ClaimTypePicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="Claim Type"
        constants={CLAIM_TYPE}
        {...this.props}
    />  
    }
}

export default ClaimTypePicker;