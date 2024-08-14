/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';

const TrpcController = () => import('../app/trpc/trpc_controller.js');
const HealthChecksController = () => import('../app/controllers/health_checks_controller.js');

router.any('/trpc/*', [TrpcController, 'index']);

router.get('/health', [HealthChecksController]);
