import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health_checks': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health_checks': { paramsTuple?: []; params?: {} }
  }
  OPTIONS: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  GET: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'health_checks': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  PUT: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  PATCH: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
  DELETE: {
    'trpc.index': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}