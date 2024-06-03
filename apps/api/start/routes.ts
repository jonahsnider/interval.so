/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';

const TrpcController = () => import('../app/controllers/trpc_controller.js');

router.any('/trpc/*', [TrpcController, 'index']);
