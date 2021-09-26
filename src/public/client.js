
let store = {
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    selectedRover: 'Curiosity',
    generalRoverData: {},
    photos: {},
    bannerSource: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Mars_Panorama_banner.jpg'
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
}

const appendRoverData = (store, name, data) => {
    store.generalRoverData[name] = data;
    renderSection("roverInfo", roverInformation);
}

const appendRoverPhotos = (store, name, data) => {
    store.photos[name] = data;
    renderSection("roverPhotos", roverPhotos);
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// returns a DOM-element
const returnElem = (elemId) => {
    return document.getElementById(elemId);
}

// hof: generic function to render only a special section to avoid a complete rerender
const renderSection = async (sectionId, renderCallback) => {
    const elem = returnElem(sectionId);
    elem.innerHTML = renderCallback(store.selectedRover);
}

// create content
const App = (state) => {
    let { selectedRover } = state

    return `
        <header>
            ${getHeader()}
        </header>
        <section>
            ${getNavbar()}
        </section>
        <main>
            <section id="roverInfo">
                ${roverInformation(selectedRover)}
            </section>
            <section id="collectionHeader">
                Most recent photos from rover ${selectedRover}
            </section>
            <section id="roverPhotos">
                ${roverPhotos(selectedRover)}
            </section>
        </main>
        <footer>Content derived from &nbsp;<a href="https://api.nasa.gov/" target="_blank">NASA&nbsp;&nbsp;API</a></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// function to render the header element of the page
const getHeader = () => {
    return`
        <div class="header">
            <img src="./assets/images/Mars_Panorama_banner.jpg" height="150px" width="100%" />
            <h1>Mars-Rover Image Exploration Dashboard</h1>
        </div>
        <div class="quotation">
            Image Source: ${store.bannerSource}
        </div>
    `
};

// function to render the navbar for the page
const getNavbar = () => {
    let navTemplate = (content) => {
        if (content === store.selectedRover) {
            return `
                <div class="navItem active">
                    ${content}
                </div>
            `
        } else {
            return `
                <div id="${content}" class="navItem" onclick="changeNavTab(id)">
                    ${content}
                </div>
            ` 
        }
        
    }

    let navitems = '';

    store.rovers.map((element) => navitems += navTemplate(element));
    
    return `
        <div class="navContainer">
            ${navitems}
        </div>
    `
}

// function to change the navbar ==> rerenders the whole App
const changeNavTab = (tabName) => {
    updateStore(store, { selectedRover: tabName });
}

// function to render and get all needed Rover information
const roverInformation = (name) => {
    const information = store.generalRoverData;

    if (!information[name]) {
        getMissionInfo(name);
    }

    if (information[name]) {
        return `
            <div><strong>Landing Date:</strong> ${information[name].landing_date}</div>
            <div><strong>Launch Date:</strong> ${information[name].launch_date}</div>
            <div><strong>Photo Date:</strong> ${information[name].max_date}</div>
            <div><strong>Total Photos:</strong> ${information[name].total_photos}</div>
            <div><strong>Status:</strong> ${information[name].status}</div>
        `
    }

    return `
        <div>Loading Rover Information ...</div>
    `
}

// function to render the most recent photos of a given rover
const roverPhotos = (name) => {
    const photos = store.photos;

    if (!photos[name]) {
        getPhotos(name);
    }

    if (photos[name]) {
        const renderCollection = renderArray(photos[name]);
        return `
            <div class="imgCollection">
                ${renderCollection()}
            </div>
        `
    }

    return `
        <div>Loading Rover Photos ...</div>
    `
}

// hof: renders the photoarray
const renderArray = (array) => {
    let out = "";
    array.forEach(element => {
        out += `
            <div class="roverImg"><img width="300" src="${element}"></div>
        `
    });

    return () => {
        return out;
    };
}

// ------------------------------------------------------  API CALLS

// function to get all necessary base information of a given rover
const getMissionInfo = (name) => {
    fetch(`http://localhost:3000/mission/${name}`)
        .then(res => res.json())
        .then(data => {
            appendRoverData(store, name, data.missionData.photo_manifest);
        });
}

// function to get most recent photos of a given rover
const getPhotos = (name) => {
    fetch(`http://localhost:3000/photos/${name}`)
        .then(res => res.json())
        .then(data => {
            const photos = data.photos.photos.map(data => {
                return data.img_src;
            });
            appendRoverPhotos(store, name, photos);
        });
}