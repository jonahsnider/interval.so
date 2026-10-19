/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router';

const TrpcController = () => import('../app/trpc/trpc_controller.ts');
const HealthChecksController = () => import('../app/controllers/health_checks_controller.ts');

router.any('/trpc/*', [TrpcController, 'index']);

router.get('/health', [HealthChecksController]);

const AccountAuthController = () => import('../app/controllers/account_auth_controller.ts');
router.any('/api/auth/*', [AccountAuthController, 'index']);
