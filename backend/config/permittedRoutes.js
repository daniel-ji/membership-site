const Cashier = require('../models/users/Cashier');
const Customer = require('../models/users/Customer');
const Manager= require('../models/users/Manager');
const Executive = require('../models/users/Executive');

const permittedRoutes = {
    'Customer': [
        {'GET': '/api/customers/self'}
    ],
    'Cashier': [
        {'GET': '/api/customers/one'}
    ],
    'Manager': [
        {'GET': '/api/customers/all'}
    ], 
    'Executive': [
        {'GET': '/api/customers/all'}
    ]
}