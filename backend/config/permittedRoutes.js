const Cashier = require('../models/users/Cashier');
const Customer = require('../models/users/Customer');
const Manager= require('../models/users/Manager');
const Owner = require('../models/users/Owner');

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
    'Owner': [
        {'GET': '/api/customers/all'}
    ]
}