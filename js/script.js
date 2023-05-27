const USER_ACTIONS = {
    create: 'create',
    edit: 'edit',
}

const USER_STATUS = {
    active: 2,
    inactive: 3
}

const userBaseUrl = 'https://frontend-test.frenet.dev/v1/user/'
const quoteUrl = 'https://frontend-test.frenet.dev/v1/quote/'

let AUTO_INCREMENT_ID = 0

let activeUser = {}

let activeAction = USER_ACTIONS.create

let shippingOptions = []

function showUserActionPage(action) {
    let {userShowPage, userActionPage} = getManipulatedElements()

    let userActionTitle = document.getElementById("userActionTitle")
    let submitButton = document.getElementById("userSubmitBtn")

    activeAction = action

    switch (action) {
        case USER_ACTIONS.create: {
            activeUser = {}
            fillUserFormData();
            userActionTitle.textContent = "Cadastrar usuário"
            submitButton.textContent = "Criar usuário"

            break;
        }
        case USER_ACTIONS.edit: {
            userActionTitle.textContent = "Editar usuário"
            submitButton.textContent = "Atualizar dados"
            fillUserFormData()
            break;
        }
        default : {
            alert('Página não encontrada!')
            showSearchPage();
            return
        }
    }

    userShowPage.style.display = "none";
    userActionPage.style.display = "block"
}

function getManipulatedElements() {
    return {
        userShowPage: document.getElementById("userShowPage"),
        userActionPage: document.getElementById("userActionPage"),
        shippingCalculatorPage: document.getElementById("shippingCalculatorPage"),
        usernameSearch: document.getElementById('usernameSearch'),
        userCard: document.getElementById('userCard'),
        shippingTable: document.getElementById('shippingTable')
    }
}

function showSearchPage() {
    let {userShowPage} = getManipulatedElements()

    resetAndHidePages();
    userShowPage.style.display = "block";
}



function resetAndHidePages() {
    let {usernameSearch, userCard, userActionPage, userShowPage, shippingCalculatorPage} = getManipulatedElements()

    resetForms();
    usernameSearch.value = ''
    userCard.style.display = "none";
    userActionPage.style.display = "none"
    userShowPage.style.display = "none";
    shippingCalculatorPage.style.display = "none";
}

function resetForms() {
    activeUser = {}
    fillUserFormData();
}

function showShippingQuotePage() {
    let {shippingCalculatorPage} = getManipulatedElements()

    resetAndHidePages();
    shippingCalculatorPage.style.display = "block"
}

function showUserCard() {
    let cardId = document.getElementById('cardId')
    let cardFullname = document.getElementById('cardFullName');
    let cardUserStatus = document.getElementById('cardUserStatus')
    let cardUsername = document.getElementById('cardUsername')
    let userCard = document.getElementById('userCard')


    const {id, username, firstName, lastName, userStatus} = activeUser

    cardId.textContent = id
    cardFullname.textContent = `${firstName} ${lastName}`
    cardUsername.textContent = username
    cardUserStatus.textContent = userStatus === USER_STATUS.active ? "Ativo" : "Inativo"
    userCard.style.display = "block"

}

function generateID() {
    let newUserId = AUTO_INCREMENT_ID;
    AUTO_INCREMENT_ID++;

    return newUserId
}

function showShippingOptions() {
    let tbody = document.getElementById("shippingTableBody");

    let { shippingTable } = getManipulatedElements()

    for(let option of shippingOptions) {
        let novaLinha = document.createElement("tr");
        let transportadoraCell = document.createElement("td");
        let custoCell = document.createElement("td");
        let tempoEntregaCell = document.createElement("td");
        let tipoEntregaCell = document.createElement("td");

        tempoEntregaCell.textContent = option.deliveryTime + " dias";
        transportadoraCell.textContent = option.carrier;
        tipoEntregaCell.textContent = option.shippingServiceName;
        custoCell.textContent = option.platformShippingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || "-";

        novaLinha.appendChild(transportadoraCell);
        novaLinha.appendChild(custoCell);
        novaLinha.appendChild(tempoEntregaCell);
        novaLinha.appendChild(tipoEntregaCell);

        tbody.appendChild(novaLinha)
    }
    shippingTable.style.display = "block";
}

function getUserData() {
    const form = document.getElementById('userActionForm')

    const {username, firstName, lastName, email, password, phone, userActive} = form.elements

    return {
        username: username.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        phone: phone.value,
        userStatus: userActive.checked ? USER_STATUS.active : USER_STATUS.inactive,
    }
}

function fillUserFormData() {
    const form = document.getElementById('userActionForm')

    const {username, firstName, lastName, email, password, phone, userStatus} = activeUser

    form.elements.username.value = username || "";
    form.elements.firstName.value = firstName || "";
    form.elements.lastName.value = lastName || "";
    form.elements.email.value = email || "";
    form.elements.password.value = password || "";
    form.elements.phone.value = phone || "";

    if (userStatus && userStatus === USER_STATUS.inactive) {
        form.elements.userInactive.checked = true;
    } else {
        form.elements.userActive.checked = true;
    }
}

async function submitUserForm() {
    switch (activeAction) {
        case USER_ACTIONS.create: {
            await createUser();
            break;
        }
        case USER_ACTIONS.edit: {
            await updateUser();
            break;
        }
    }
}

async function createUser() {
    let newUser = getUserData()

    newUser = {
        ...newUser,
        id: generateID()
    }

    let init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
    }

    await fetch(userBaseUrl, init)
        .then(res => res.json())
        .then((data) => {
            alert("Usuario criado: " + data.username)
            showSearchPage()
        })
        .catch(e => {
            alert("Erro ao criar usuário!")
            console.error(e)
        })
}

async function findUser() {
    let usernameSearch = document.getElementById('usernameSearch').value

    await fetch(userBaseUrl + usernameSearch, {
        method: 'GET'
    })
        .then(res => res.json())
        .then(data => {
            if (data !== undefined && data !== null && data?.status !== 404) {
                activeUser = data
                showUserCard();
            } else {
                alert("Usuario não encontrado!")
            }
        })
        .catch(() => {
            alert("Usuario não encontrado!")
        })
}

async function updateUser() {
    let updatedUser = getUserData()

    let init = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser)
    }

    await fetch(userBaseUrl + activeUser.username, init)
        .then(res => res.json())
        .then((data) => {
            alert("usuario atualizado: " + data.username)
            showSearchPage()
        })
}

async function deleteUser() {
    let init = {method: "DELETE"}

    await fetch(userBaseUrl + activeUser.username, init)
        .then(res => res.json())
        .then(data => {
            alert("usuario deletado: " + data.username)
        })
        .catch(e => e)
        .finally(() => {
            document.getElementById("closeDeleteModal").click()
            showSearchPage()
        })
}

async function getQuoteShippings() {
    const form = document.getElementById('shippingForm')

    const {zipCodeSource, zipCodeDestination, objectWeight, objectWidth, objectHeigth, objectLength} = form.elements

    let shippingData = {
        zipCodeSource: zipCodeSource.value,
        zipCodeDestination: zipCodeDestination.value,
        weight: objectWeight.value,
        dimension: {
            width: objectWidth.value,
            height: objectHeigth.value,
            length: objectLength.value
        }
    }

    let init = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingData)
    }

    await fetch(quoteUrl, init)
        .then(res => res.json())
        .then((data) => {
            if (data.quotations.length > 0) {
                shippingOptions = data.quotations
                showShippingOptions()
            }
        })

}


document.getElementById('userActionForm').addEventListener('submit', function (event) {
    event.preventDefault();
});

document.getElementById('shippingForm').addEventListener('submit', function (event) {
    event.preventDefault();
});

document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();
});