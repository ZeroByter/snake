import React from "react"

export default class About extends React.Component{
    render(){
        return (
            <div className="about-page middle-page-container">
                <p>(WIP about-page, will be updated in the future... along with the rest of the site...)</p>
                <p>This game is heavily inspired by <a href="http://www.onemotion.com/flash/snake-game/" target="_blank">onemotions.com snake game</a></p>
                <p>Unfortunately, since Flash is no longer supported, that game is no longer playable and I really started to miss it!</p>
                <p>So I made my own copy of the game! And after I did that I added some more features of my own...</p>
                <p>
                    <ul>
                        <li>Game spectating system (WIP)... just for fun...</li>
                        <li>High-score system (planned, not yet implemented)</li>
                    </ul>
                </p>
                <p>This project is completely open-source at <a href="https://github.com/ZeroByter/snake" target="_blank">GitHub!</a></p>
            </div>
        )
    }
}