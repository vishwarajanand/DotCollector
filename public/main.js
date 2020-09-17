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
        const body = React.createElement('td', null, `${JSON.stringify(Dot.body)}`);
        const ts = React.createElement('td', null, `${this.timeSince(new Date(Dot.timestamp))}`);

        return React.createElement('tr', null, ts, body);
    }
}

class DotTable extends React.Component {
    render() {
        const rows = [];

        this.props.Dots.forEach((Dot) => {
            const id = Dot._id;
            const props = Dot;
            props.key = Dot._id;
            rows.push(
                React.createElement(DotRow, props));
        });

        return React.createElement('table', null,
            React.createElement('thead', null,
                React.createElement('tr', null,
                    React.createElement('th', null, `Timestamp`),
                    React.createElement('th', null, `Dot`))),
            React.createElement('tbody', null,
                rows
            ),
        );
    }
}

// class Setting extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { value: 100 };
//         this.updateCounter = this.updateCounter.bind(this);
//     }

//     updateCounter(val) {
//         this.setState({ value: val });
//     }

//     render() {
//         return React.createElement('div', null, React.createElement('input', { type: 'range', min: 5, max: 10000, onClick: this.props.updateCounter(this.value), value: this.state.value }, null));
//     }
// }

// class Settings extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = { limit: 100, lookback_seconds: 100 };
//     }

//     render() {
//         return React.createElement('div',
//             null,
//             React.createElement(Setting, { value: limit }, null),
//             React.createElement(Setting, { value: lookback_seconds }, null));
//     }
// }

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
            console.log("Invalid body value!");
        }
    }

    componentDidMount() {
    }

    render() {
        return React.createElement('div',
            null,
            React.createElement('textarea',
                {
                    value: this.state.body,
                    onChange: this.changeBody.bind(this),
                    // defaultValue: '',
                    className: 'base-box'
                }),
            React.createElement('input',
                { type: 'button', onClick: this.send.bind(this), value: 'Submit', className: 'button btn-start' },
                null)
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
            return e(
                'button',
                { onClick: () => this.fetch() },
                'Refresh'
            );
        }

        return React.createElement('div',
            null,
            React.createElement(AddDots,
                { updateData: this.fetch.bind(this) }),
            React.createElement('br'),
            React.createElement(DotTable, { Dots: this.state.dots })
        );
    }
}

const domContainer = document.querySelector('#main_container');
ReactDOM.render(e(MainApp), domContainer);
