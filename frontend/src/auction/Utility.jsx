export const getTeamBudgetForView = (number) => {
    number = parseInt(number);
    return (number / 100000) + " L";
}

export const getTeamNameForLogo = (name) => {
    name = name.split(" ");
    if (name.length >= 2) {
        return name[0][0] + name[1][0];
    }
    return name[0][0] + name[0][1];
}

export const getTeamBudget = (teamId, teams) => {
    var team = teams.find((t) => { return t._id == teamId });
    if (team) {
        return parseInt(team.budget);
    } else {
        return "null";
    }
}

export const getTeamName = (teamId, teams) => {
    var team = teams.find((t) => { return t._id == teamId });
    if (team) {
        return team.name;
    } else {
        return "null";
    }
}

export const getProfilePicture = (player) => {
    var name = player.name;
    name = name.split(" ");
    let sn = name[0][0];
    if (name[1]) {
        sn += name[1][0];
    }
    return (<div className='flex flex-col justify-center items-center sm:text-xl md:text-2xl lg:text-4xl sm:min-w-[100px] sm:min-w-[100px] md:min-w-[150px] sm:min-h-[100px] sm:min-h-[100px] lg:min-h-[150px] capitalize'>{sn}</div>)
}