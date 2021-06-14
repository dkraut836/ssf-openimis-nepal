import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Grid } from "@material-ui/core";
import {
    withModulesManager,
    TextInput, ProgressOrError,
} from "@openimis/fe-core";

import { fetchInsuree } from "../actions";
import _debounce from "lodash/debounce";

const INIT_STATE = {
    search: null,
    selected: null,
}

class InsureeChfIdPicker extends Component {

    state = INIT_STATE;

    constructor(props) {
        super(props);
        this.chfIdMaxLength = props.modulesManager.getConf("fe-insuree", "insureeForm.chfIdMaxLength", 12);
    }

    componentDidMount() {
        if (this.props.value) {
            this.setState({
                search: !!this.props.value ? this.props.value.chfId : null,
                selected: this.props.value,
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.id && this.props.id != prevProps.id){
            this.setState({
                search:this.props.id,
            })
            this.debouncedSearch(this.props.id)
        }
        if (prevProps.reset !== this.props.reset) {
            this.setState({
                ...INIT_STATE,
                search: !!this.props.value ? this.props.value.chfId : null,
                selected: this.props.value
            });
        } else if (!_.isEqual(prevProps.insuree, this.props.insuree)) {
            console.log('elsee iff')
            this.props.onChange(this.props.insuree, this.formatInsuree(this.props.insuree))
        } else if (!_.isEqual(prevProps.value, this.props.value)) {
            console.log('elsee')
            this.setState({
                search: !!this.props.value ? this.props.value.chfId : null,
                selected: this.props.value
            });
        }
    }

    fetch = (chfId) => {
        this.setState(
            {
                search: chfId,
                selected: null
            },
            e => this.props.fetchInsuree(this.props.modulesManager, chfId)
        );
    }

    debouncedSearch = _debounce(
        this.fetch,
        this.props.modulesManager.getConf("fe-insuree", "debounceTime", 800)
    )


    formatInsuree(insuree) {
        if (!insuree) return null;
        return `${insuree.otherNames} ${insuree.lastName}`
    }

    render() {
        console.log('hit on pickerr', this.props.id)
        const { readOnly = false, required= false, error } = this.props;
        console.log('this.props.error',this.props.error)
//        const err=error===null?" ":error.detail
        return (
            <Grid container>
                <Grid item xs={4}>
                    <TextInput
                        readOnly={readOnly}
                        autoFocus={true}
                        module="insuree"
                        label="Insuree.chfId"
                        error={error === null?"":error.detail}
                        value={this.state.search}
                        onChange={v => this.debouncedSearch(v)}
                        inputProps={{
                            "maxLength": this.chfIdMaxLength,
                        }}
                        required={required}
                    />
                </Grid>
                <Grid item xs={8}>
                    <ProgressOrError progress={this.props.fetching} />
                    {!this.props.fetching && error===null && (
                        <TextInput
                            readOnly={true}
                            module="insuree"

                            label="Insuree.names"
                            value={this.formatInsuree(this.state.selected)}
                        />
                    )}
                </Grid>
            </Grid>
        )
    }
}

const mapStateToProps = (state, props) => ({
    fetching: state.insuree.fetching,
    error: state.insuree.error,
    insuree: state.insuree.insuree,
    id:state.claim.id
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchInsuree }, dispatch);
};

export default withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(InsureeChfIdPicker)
)
