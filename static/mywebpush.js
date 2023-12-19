'use strict';

const pushButton = document.querySelector('.js-push-btn');
let isSubscribed = false;
let swRegistration = null;


function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails = document.querySelector('.js-subscription-details');

    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.classList.remove('is-invisible');
    } else {
        subscriptionDetails.classList.add('is-invisible');
    }
}

const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

function subscribeUser() {
    const applicationServerPublicKey = localStorage.getItem('applicationServerPublicKey');
    const applicationServerPublicKeyB64 = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerPublicKeyB64
        })
        .then(function(subscription) {
            console.log("◼"+'User is subscribed.');
            updateSubscriptionOnServer(subscription);
            localStorage.setItem('sub_token',JSON.stringify(subscription));
            isSubscribed = true;
            updateBtn();
        })
        .catch(function(err) {
            console.log("◼"+'Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch(function(error) {
            console.log("◼"+'Error unsubscribing', error);
        })
        .then(function() {
            updateSubscriptionOnServer(null);
            console.log("◼"+'User is unsubscribed.');
            isSubscribed = false;
            updateBtn();
        });
}

function initializeUI() {
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            isSubscribed = !(subscription === null);
            updateSubscriptionOnServer(subscription);
            if (isSubscribed) {
                console.log("◼"+'User IS subscribed.');
            } else {
                console.log("◼"+'User is NOT subscribed.');
            }
            updateBtn();
        });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log("◼"+'Service Worker and Push is supported');

    navigator.serviceWorker.register("/static/myserviceworker.js")
        .then(function(swReg) {
            console.log("◼"+'Service Worker is registered', swReg);
            swRegistration = swReg;
            initializeUI();
        })
        .catch(function(error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push not supported');
    pushButton.textContent = 'Push Not Supported';
}

function push_message() {
    // fetch('http://127.0.0.1:5000/push_v1/', {
    fetch('https://aiqua-flask-danjang.koyeb.app/push_v1/', {
        method: 'post',// 'post', 'get'
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({'sub_token':localStorage.getItem('sub_token')}),
    })
    .then(response => { 
        return response.json()
    })
    .then(json => { 
        console.log("◼"+"push_message",json); 
    })
    .catch(error => { console.error(error); });        
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("◼"+'document is ready. DOMContentLoaded');
    // fetch('http://127.0.0.1:5000/subscription/', {
    fetch('https://aiqua-flask-danjang.koyeb.app/subscription/', {
        method: 'get',// 'post', 'get'
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => { 
        return response.json()
    })
    .then(json => {
        console.log("◼"+"my.VAPID.public_key",json); 
        localStorage.setItem('applicationServerPublicKey',json.public_key);
    })    
    .catch(error => { console.error(error); });    
 });