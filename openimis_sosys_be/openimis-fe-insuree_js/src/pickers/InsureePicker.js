import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { injectIntl } from 'react-intl';
import { fetchInsurees } from "../actions";
import { TextInput, Picker, withModulesManager } from "@openimis/fe-core";
import _ from "lodash";

const styles = theme => ({
    label: {
        color: theme.palette.primary.main
    },
    item: {
        padding: theme.spacing(1)
    }
});

class RawFilter extends Component {
    state = {
        chfId: "",
        lastName: "",
        otherNames: "",
        page: 0,
        pageSize: 0,
        afterCursor: null,
        beforeCursor: null,
    }

    stateToFilters = () => {
        let filters = [];
        if (!!this.state.chfId) {
            filters.push(`chfId_Istartswith: "${this.state.chfId}"`)
        }
        if (!!this.state.lastName) {
            filters.push(`lastName_Istartswith: "${this.state.lastName}"`)
        }
        if (!!this.state.otherNames) {
            filters.push(`otherNames_Istartswith: "${this.state.otherNames}"`)
        }
        return filters;
    }

    _onChange = (a, v) => {
        this.setState(
            { [a]: v },
            e => this.props.onChange(this.stateToFilters())
        )
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid container>
                <Grid item xs={4} className={classes.item}>
                    <TextInput
                        autoFocus={true}
                        module="insuree"
                        label="Insuree.chfId"
                        value={this.state.chfId}
                        onChange={v => this._onChange("chfId", v)}
                    />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                    <TextInput
                        module="insuree"
                        label="Insuree.lastName"
                        value={this.state.lastName}
                        onChange={v => this._onChange("lastName", v)}
                    />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                    <TextInput
                        module="insuree"
                        label="Insuree.otherNames"
                        value={this.state.otherNames}
                        onChange={v => this._onChange("otherNames", v)}
                    />
                </Grid>
            </Grid>
        )
    }
}

const Filter = withTheme(withStyles(styles)(RawFilter));

const INIT_STATE = {
    page: 0,
    pageSize: 10,
    afterCursor: null,
    beforeCursor: null,
    filters: [],
    selected: null,
}

class InsureePicker extends Component {

    state = INIT_STATE;

    componentDidMount() {
        if (this.props.value) {
            this.setState({ selected: this.props.value });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.reset !== this.props.reset) {
            this.setState({
                ...INIT_STATE,
                selected: this.props.value
            });
        } else if (!_.isEqual(prevProps.value, this.props.value)) {
            this.setState({ selected: this.props.value });
        }
    }

    formatSuggestion = a => !!a ? `${a.lastName} ${a.otherNames} (${a.chfId})` : ""

    filtersToQueryParams = () => {
        let prms = [...this.state.filters];
        prms = prms.concat(`first: ${this.state.pageSize}`);
        if (!!this.state.afterCursor) {
            prms = prms.concat(`after: "${this.state.afterCursor}"`)
        }
        if (!!this.state.beforeCursor) {
            prms = prms.concat(`before: "${this.state.beforeCursor}"`)
        }
        return prms;
    }

    getSuggestions = (filters) => {
        this.setState(
            { filters: filters },
            e => this.props.fetchInsurees(this.props.modulesManager, this.filtersToQueryParams())
        );
    }

    debouncedGetSuggestion = _.debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-insuree", "debounceTime", 800)
    )

    onChangeRowsPerPage = (cnt) => {
        this.setState(
            {
                pageSize: cnt,
                page: 0,
                afterCursor: null,
                beforeCursor: null,
            },
            e => this.props.fetchInsurees(this.props.modulesManager, this.filtersToQueryParams())
        )
    }

    onSelect = v => {
        this.setState(
            { selected: v },
            this.props.onChange(v, this.formatSuggestion(v))
        )
    }

    onChangePage = (page, nbr) => {
        if (nbr > this.state.page) {
            this.setState(
                {
                    page: this.state.page + 1,
                    beforeCursor: null,
                    afterCursor: this.props.insureesPageInfo.endCursor,
                },
                e => this.props.fetchInsurees(this.props.modulesManager, this.filtersToQueryParams())
            )
        } else if (nbr < this.state.page) {
            this.setState(
                {
                    page: this.state.page - 1,
                    beforeCursor: this.props.insureesPageInfo.startCursor,
                    afterCursor: null,
                },
                e => this.props.fetchInsurees(this.props.modulesManager, this.filtersToQueryParams())
            )
        }
    }

    render() {
        const { insurees, insureesPageInfo, readOnly = false, required = false, withLabel = true } = this.props;
        
        return (
            <Picker
                module="insuree"
                label={!!withLabel ? "Insuree.label" : null}
                dialogTitle="Insuree.picker.dialog.title"
                filter={<Filter onChange={this.debouncedGetSuggestion} />}
                suggestions={insurees}
                suggestionFormatter={this.formatSuggestion}
                page={this.state.page}
                pageSize={this.state.pageSize}
                count={insureesPageInfo.totalCount}
                onChangePage={this.onChangePage}
                onChangeRowsPerPage={this.onChangeRowsPerPage}
                onSelect={this.onSelect}
                value={this.state.selected}
                readOnly={readOnly}
                required={required}
            />
        )
    }
}

const mapStateToProps = state => ({
    insurees: state.insuree.insurees,
    insureesPageInfo: state.insuree.insureesPageInfo,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchInsurees }, dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(InsureePicker)))));
