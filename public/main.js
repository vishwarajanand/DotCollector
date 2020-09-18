'use strict';

const e = React.createElement;

class DotRow extends React.Component {
    timeSince(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    }

    render() {
        const Dot = this.props;
        const body = e('td', { className: 'td' }, `${JSON.stringify(Dot.body)}`);
        const ts = e('td', { className: 'td' }, `${this.timeSince(new Date(Dot.timestamp))}`);

        return e('tr', null, ts, body);
    }
}

class DotTable extends React.Component {

    componentDidMount() {
        this.interval = setInterval(
            () => {
                // Update the DotTable component every 1s
                this.setState({ time: Date.now() }), 1000
            });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const rows = [];

        this.props.Dots.forEach((Dot) => {
            const id = Dot._id;
            const props = Dot;
            props.key = Dot._id;
            rows.push(
                e(DotRow, props));
        });

        return e('table', { className: 'table' },
            e('thead', null,
                e('tr', null,
                    e('th', { className: 'th' }, `Timestamp`),
                    e('th', { className: 'th' }, `Dots`))),
            e('tbody', null,
                rows
            ),
        );
    }
}

class Setting extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: 100,
            name: this.props.name,
            configs:
            {
                STEP: 1,
                MIN_LIMIT: 1,
                MAX_LIMIT: 10000
            }
        };
        this.callback = this.props.callback;
    }

    update(val) {
        if (
            val &&
            val.target &&
            val.target.value !== undefined &&
            val.target.value >= this.state.configs.MIN_LIMIT &&
            val.target.value <= this.state.configs.MAX_LIMIT
        ) {
            this.setState({
                value: val.target.value,
                [`${this.state.name}`]: val.target.value
            });
            // console.log("Setting value updated!");
        }
        else {
            this.setState({ value: 100 });
            console.log("Default setting applied!");
        }

        this.callback({
            settings: {
                [`${this.state.name}`]: this.state.value
            },
            name: this.state.name,
            value: this.state.value
        });
    }

    render() {
        return e('input',
            {
                type: 'range',
                min: this.state.configs.MIN_LIMIT,
                max: this.state.configs.MAX_LIMIT,
                step: this.state.configs.STEP,
                onChange: this.update.bind(this),
                value: this.state.value
            }
        );
    }
}

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings:
            {
                limit: 100,
                lookback_seconds: 100
            }
        };
        this.callback = this.props.saveSettings;
    }

    update(val) {
        if (
            val &&
            val.name &&
            val.value
        ) {
            this.setState({
                settings:
                {
                    ...this.state.settings,
                    [`${val.name}`]: val.value
                }
            });
            console.log("Setting value updated!");
        }
        else {
            console.log("Invalid setting passed!");
        }

        this.callback(this.state.settings);
    }

    render() {
        return e('div',
            null,
            e('p',
                null,
                'Max Dots to Pull',
                e('br'),
                e(Setting,
                    {
                        name: 'limit',
                        value: this.state.settings.limit,
                        callback: this.update.bind(this)
                    },
                )
            ),
            e('p',
                null,
                'Lookback Time in Seconds',
                e('br'),
                e(Setting,
                    {
                        name: 'lookback_seconds',
                        value: this.state.settings.lookback_seconds,
                        callback: this.update.bind(this)
                    },
                )
            ),
            e('br'),
        );
    }
}

//TODO: add settings here!!
class AddDots extends React.Component {
    constructor(props) {
        super(props);
        this.state = { body: '' };
        this.callback = this.props.updateData;
    }

    send() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: this.state.body })
        };
        if (this.state.body === undefined || this.state.body.length <= 0) {
            console.log("Attempted to send Dot without any data!");
            // this.setState({ body: '' })
            return;
        }
        fetch('/add_feedback', requestOptions)
            .then(async response => {
                const data = await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    // this.setState({ errorMessage: error.toString() });
                    console.error('There was an error!', error);
                    return;
                }
                console.log("Dot added!! Resetting now ...");
                // this.setState({ body: '' })
                // this.callback(this.state.value);
            })
            .catch(error => {
                // this.setState({ errorMessage: error.toString() });
                console.error('There was an error!', error);
            }).finally(() => {
                this.setState({ body: '' })
                this.callback(this.state.value);
            });
    }

    changeBody(val) {
        if (val && val.target && val.target.value !== undefined && val.target.value.length > 0) {
            this.setState({ body: val.target.value });
            // this.state.body = val.target.value;
            console.log("Body value updated!");
        }
        else {
            this.setState({ body: '' });
            console.log("Invalid body value!");
        }
    }

    saveSettings(val) {
        // console.log(JSON.stringify(val));
        if (val && val.target && val.target.value !== undefined) {
            console.log(`Settings saved in AddDots! : ${val.target.value}`);
        } else {
            // console.log("invalid val in save setings");
        }
    }

    componentDidMount() {
    }

    render() {
        return e('div',
            null,
            e('div',
                null,
                e('textarea',
                    {
                        value: this.state.body,
                        onChange: this.changeBody.bind(this),
                        // defaultValue: '',
                        className: 'base-box',
                        placeholder: 'Add some text to add into Mongo as dots!'
                    }),
                // e('br'),
                e('input',
                    {
                        type: 'button',
                        onClick: this.send.bind(this),
                        value: 'Submit',
                        className: 'button btn-start'
                    },
                    null)
            ), e('div',
                null,
                e(Settings,
                    {
                        saveSettings: this.saveSettings.bind(this)
                    },
                    null
                )
            )
        );
    }
}

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dots: [] };
    }

    fetch() {
        this.componentDidMount();
    }

    componentDidMount() {
        fetch('/get_feedbacks')
            .then(res => {
                console.log(res);
                return res.json()
            })
            .then(res => {
                console.log(res);
                this.state.dots = res
                this.setState({ state: this.state });
            });
    }

    render() {
        if (this.state.dots.length <= 0) {
            return e('div', null,
                e(
                    AddDots,
                    {
                        updateData: this.fetch.bind(this)
                    }
                ),
                e('br'),
                e(
                    'button',
                    { onClick: () => this.fetch() },
                    'Refresh',
                ));
        }

        return e('div',
            null,
            e(AddDots,
                { updateData: this.fetch.bind(this) }),
            e('br'),
            e(DotTable, { Dots: this.state.dots })
        );
    }
}

const domContainer = document.querySelector('#main_container');
ReactDOM.render(e(MainApp), domContainer);
