// This is what makes the api requests and translates the responses into schema shape
const { RESTDataSource } = require('apollo-datasource-rest');

// Creating Data Source class and stating the API url
class LaunchAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spacexdata.com/v2/';
    }

    // Making a request to the launches endpoint and then mapping over the response to translate the data
    async getAllLaunches() {
        const response = await this.get('launches');
        return Array.isArray(response)
            ? response.map(launch => this.launchReducer(launch))
            : []
    }

    //getting launch by Id and pass it to the launchReducer function
    async getLaunchById({ launchId }) {
        const response = await this.get('launches', { flight_number: launchId });
        return this.launchReducer(response[0]);
    }

    getLaunchesByIds({ launchIds }) {
        return Promise.all(
            launchIds.map(launchId => this.getLaunchById({ launchId }))
        );
    }
    // The reducer function that translates the data
    launchReducer(launch) {
        return {
            id: launch.flight_number || 0,
            cursor: `${launch.launch_date_unix}`,
            site: launch.launch_site && launch.launch_site.site_name,
            mission: {
                name: launch.mission_name,
                missionPatchSmall: launch.links.mission_patch_small,
                missionPatchLarge: launch.links.mission_patch,
            },
            rocket: {
                id: launch.rocket.rocket_id,
                name: launch.rocket.rocket_name,
                type: launch.rocket.rocket_type,
            },
        };
    }

}

module.exports = LaunchAPI;