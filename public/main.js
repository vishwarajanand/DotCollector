'use strict';

const e = React.createElement;

class DotRow extends React.Component {
    render() {
        const Dot = this.props;
        const body = React.createElement('td', null, `${JSON.stringify(Dot.body)}`);
        const ts = React.createElement('td', null, `${new Date(Dot.timestamp).toISOString()}`);

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

        return React.createElement(DotTable, { Dots: this.state.dots });
    }
}

const domContainer = document.querySelector('#main_container');
ReactDOM.render(e(MainApp), domContainer);
