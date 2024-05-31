'use client';

import type { PropsWithChildren } from 'react';
import { trpc } from '../trpc';

const Component = ({ children }: PropsWithChildren) => children;

export const TrpcProvider = trpc.withTRPC(Component) as typeof Component;
