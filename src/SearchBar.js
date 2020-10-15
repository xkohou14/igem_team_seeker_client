import React, {Component} from "react";
import TeamItem from "./TeamItem";
import BioBricksItem from "./BioBricksItem";
import './SearchBar.css';

// This class creates search bar for teams or biobricks
class SearchBar extends Component {
    constructor(props) {
        super(props);
        const option = this.props.selectedTeams ? "abstract" : "content"
        this.state = {
            search: '',
            results: [],
            isTeams: true,
            selectedOption: option,
            contain: true,
        }
        this.tagsBio = ["title", "content"]
        this.tagsTeams = ["title", "year", "school", "country", "abstract"]
        this.master = this.props.master
        this.query = {}
        this.fetchData = this.fetchData.bind(this)
        this.addToQuery = this.addToQuery.bind(this)
    }

    // This function handles search button click
    handleOnClick(event) {
        event.preventDefault();
        this.fetchData()
    }

    // This function handles click on switch search bar button
    async handleOnClickSwitchSearch(event) {
        event.preventDefault();
        await this.setState(prevState => ({
            isTeams: !prevState.isTeams
        }));

        this.state.isTeams ? this.setState({
            selectedOption: "abstract"
        })
        : this.setState({
            selectedOption: "content"
        })
        this.master.clickMaster();
    }

    // This function handles enter key press
    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.fetchData()
        }
    }

    // This function adds parameter to POST query, where property name is "tag" variable
    addToQuery(tag) {
        this.query = {}

        // if the tag name is year and search text includes alphabet characters, don't include it to query
        if (tag === "year" && this.state.search.match(/^$|^[A-Za-z]+$/))
            return

        if (tag === "school")
            tag = "schoolAddress"

        // build query according to current text in search bar and if the contain checkbox is checked
        // name of the property is derived from name of currently checked radio button
        this.query[tag] = [{
            contain: this.state.contain,
            value: this.state.search
        }];
        // after constructing a query we send a request to API
        this.fetchData()
    }

    // This function sets new state of radio button and adds new property to query
    async checkChanged(event) {
        await this.setState({
            selectedOption: event.target.value
        })
        this.addToQuery(this.state.selectedOption)
    }

    // This function sets new state of "contains" checkbox and adds new property to query
    async checkContainsChanged() {
        this.setState({
            contain: !this.state.contain
        })
        this.addToQuery(this.state.selectedOption)
    }

    // This function sets new value to property each time something to search is written
    async onInputChange(event) {
        await this.setState({
            search: event.target.value
        })
        this.addToQuery(this.state.selectedOption)
    }

    // This function build and send POST request to API with created query
    async fetchData() {
        this.setState({
            results: this.isEmpty(this.query) ?
                this.props.items
                :
                this.props.items.filter(item => this.matchQuery(item, this.query))
        })
    }

    matchQuery(data, q) {
        try {
            let match = true;
            for(let prop in q) {
                match = q[prop].map(el => {
                    const dProp = data[prop];
                    if (el.contain) {
                        return dProp.toString().includes(el.value);
                    } else {
                        return !dProp.toString().includes(el.value);
                    }
                }).reduce((l,r) => l && r, true);

                if (!match) {
                    return false;
                }
            }
        } catch (e) {
            console.log(e)
        }

        return true;
    };
    isEmpty(obj) {
        for(let property in obj) {
            if(obj.hasOwnProperty(property)) {
                return false;
            }
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    render() {

        var itemList

        // If there are no search results return default list of all items
        if (this.state.search.length > 0 && this.state.results.length > 0) {
            itemList = this.state.results
        } else if (this.state.search.length > 0 && this.state.results.length === 0) {

        } else {
            itemList = this.props.items
        }
        // itemList = this.state.search.length > 0 && this.state.results.length > 0 ? this.state.results : this.props.items

        var itemComponents = [];

        if (itemList) {
            // This function maps item Component to every search result object
            itemComponents = itemList.filter(item => item.title !== undefined).map(item => {
                    return (this.state.isTeams ?
                            <TeamItem key={item.id} item={item}/> :
                            <BioBricksItem key={item.id} item={item}/>
                    )
                }
            );
        }

        // Here is every item from "tags" maps on radio buttons and binded with their functionality
        const tags = this.state.isTeams ? this.tagsTeams : this.tagsBio
        const checks = tags.map((element, index) => {
            return (
                <div key={index} className="radio-tag" >
                    <label >
                        {element}
                    </label>
                    <input
                        type="radio"
                        value={element}
                        checked={this.state.selectedOption === element}
                        onChange={this.checkChanged.bind(this)}
                    />
                </div>
            )
        })

        const searchTag = "Search for " + (this.state.isTeams ? "teams" : "biobricks") + " ..."

        // Here the search bar and search results are rendered
        return (
            <div>
                <h1 className="App-header">
                    {this.state.isTeams ? "Team" : "BioBricks"} Seeker
                </h1>
                <button
                    className="btn-switch"
                    type="submit"
                    onClick={this.handleOnClickSwitchSearch.bind(this)}>
                    {this.state.isTeams ? "BioBricks" : "Teams"}
                </button>
                <button
                    className="btn-search"
                    type="submit"
                    onClick={this.handleOnClick.bind(this)}>
                    Search
                </button>
                <form className="form">
                    <input
                        className="search"
                        type="text"
                        onKeyDown={this.handleKeyDown.bind(this)}
                        value={this.state.search}
                        placeholder={searchTag}
                        onChange={this.onInputChange.bind(this)}
                    />
                    <span>
                        Displayed: {itemComponents.length}
                    </span>
                </form>
                <div>
                    <div className="radio-tag">
                        <label>
                            contains
                        </label>
                        <input
                            type="checkbox"
                            name="contains"
                            checked={this.state.contain}
                            onChange={this.checkContainsChanged.bind(this)}
                        />
                    </div>
                    {checks}
                </div>
                <div>
                    {itemComponents}
                </div>
            </div>
        )
    }
}

export default SearchBar