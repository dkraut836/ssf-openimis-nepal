import React, { Component, Fragment } from "react";
import { injectIntl, FormattedDate } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { formatMessage, withModulesManager, Contributions, ControlledField } from "@openimis/fe-core";

const INSUREE_SUMMARY_AVATAR_CONTRIBUTION_KEY = "insuree.InsureeSummaryAvatar";
const INSUREE_SUMMARY_CORE_CONTRIBUTION_KEY = "insuree.InsureeSummaryCore";
const INSUREE_SUMMARY_EXT_CONTRIBUTION_KEY = "insuree.InsureeSummaryExt";
const INSUREE_SUMMARY_CONTRIBUTION_KEY = "insuree.InsureeSummary";

const styles = theme => ({
    rawValue: {
        textAlign: "center",
    },
    label: {
        textAlign: "right",
    },
    fspContainer: {
        marginTop: 10,
    }
});

class InsureeSummary extends Component {
    render() {
        const { modulesManager, classes, insuree } = this.props;
        let hasAvatarContribution = modulesManager.getContribs(INSUREE_SUMMARY_AVATAR_CONTRIBUTION_KEY).length > 0
        let hasExtContributions = modulesManager.getContribs(INSUREE_SUMMARY_EXT_CONTRIBUTION_KEY).length > 0
        return (
            <Grid container>
                {hasAvatarContribution && (
                    <Grid item xs={2}>
                        <Contributions contributionKey={INSUREE_SUMMARY_AVATAR_CONTRIBUTION_KEY} />
                    </Grid>
                )}
                <Grid item xs={hasAvatarContribution ? 10 : 12}>
                    <ControlledField module="insuree" id="InsureeSummary.chfId" field={(
                        <Grid item xs={12}>
                            <Typography className={classes.rawValue} variant="h4">{insuree && insuree.chfId}</Typography>
                        </Grid>
                    )}/>
                    <Grid item xs={12}>
                        <Grid container>
                        <Grid item xs={hasExtContributions ? 6 : 12}>
                            <Grid container>
                                <Grid item xs={12}>
                                    <Typography className={classes.rawValue} variant="h6">
                                        {insuree &&
                                            <Fragment>
                                                <ControlledField module="insuree" id="InsureeSummary.otherNames" field={`${insuree.otherNames} `} />
                                                <ControlledField module="insuree" id="InsureeSummary.lastName" field={insuree.lastName} />
                                            </Fragment>
                                        }
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography className={classes.rawValue} variant="h6">
                                        {insuree && (
                                            <Fragment>
                                                <ControlledField module="insuree" id="InsureeSummary.dob" field={
                                                    <FormattedDate value={insuree.dob} />
                                                } />
                                                <ControlledField module="insuree" id="InsureeSummary.age" field={
                                                    ` (${insuree.age} ${formatMessage(this.props.intl, "insuree", "ageUnit")})`
                                                } />
                                            </Fragment>
                                        )}
                                    </Typography>
                                </Grid>
                                <ControlledField module="insuree" id="InsureeSummary.gender" field={(
                                    <Grid item xs={12}>
                                        <Typography className={classes.rawValue} variant="h6">
                                            {insuree && insuree.gender && insuree.gender.gender}
                                        </Typography>
                                    </Grid>
                                )} />

                                <Contributions contributionKey={INSUREE_SUMMARY_CORE_CONTRIBUTION_KEY} />
                            </Grid>
                        </Grid>
                        {hasExtContributions && (
                            <Grid item xs={6}>
                                <Contributions contributionKey={INSUREE_SUMMARY_EXT_CONTRIBUTION_KEY} />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Contributions contributionKey={INSUREE_SUMMARY_CONTRIBUTION_KEY} />
            </Grid>
            </Grid >
        );
    }
}

export default withModulesManager(injectIntl(withTheme(
    withStyles(styles)(InsureeSummary)
)));
