import React, {Component} from "react";
import './App.css'
import SearchBar from "./SearchBar";
import data from "./igem_data.json"

// This class renders whole web application
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: data.teams.map(item => ({
                title: item.title,
                year: item.year,
                description: item.abstract,
                teamId: item.teamId,
                country: item.country,
                schoolAddress: item.schoolAddress,
                wiki: item.wiki
            })),
            biobricks: data.biobricks.map(item => ({
                title: item.title,
                description: item.content,
                wiki: item.url,
            })),
            isTeams: true
        }
    }

    isEmpty(obj) {
        for(let property in obj) {
            if(obj.hasOwnProperty(property)) {
                return false;
            }
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    // This function switches between rendering search bar for teams or for biobricks
    clickMaster() {
        this.setState({
            isTeams: !this.state.isTeams
        })
    }

    render() {
        return (
            // App class renders particular search bar according to isTeams value
            <div className="App">
                {this.state.isTeams ? <SearchBar
                    items={this.state.teams}
                    master={this}
                    selectedTeams={true}
                /> : <SearchBar
                    items={this.state.biobricks}
                    master={this}
                    selectedTeams={false}
                />}
            </div>
        )
    }
}

export default App