import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { REASON_ADMIT } from "../constants";
class ReasonToAdminPicker extends Component {

    render() {
        return  <ConstantBasedPicker
        module="claim"
        label="ReasonToAdmit"
        constants={REASON_ADMIT}
        {...this.props}
    />  
    }
}

export default ReasonToAdminPicker;