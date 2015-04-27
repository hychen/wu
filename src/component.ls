require! path
require! machine

{syntax-validator} = require './syntax'

export function ensured-component-options(options)
  #@TODO: check component options.
  throw new Error 'component options is required.' unless typeof options is 'object'
  return options

export function ensured-component(component)
  validate = syntax-validator 'Component'
  if validate component
    # JSON Schema does not support function type, we need 
    # check it by ourself.
    if typeof component.fn is 'function'
      #@TODO: check component function signature.
      return component
    else
      throw new Error "component.fn is not a function."
  else
    throw validate.errors

export function load-component(fpath, options)
  mod = require path.resolve fpath  
  unless mod.provide-component?
    throw "module loaded from #{fpath} does not have provideComponent function."

  if options    
    options = ensured-component-options options 
    defs = mod.provide-component options
  else
    defs = mod.provide-component null

  # @TODO: check definition
  return defs <<< do
    inports: defs.inputs or {}
    outports: defs.outputs or {}

export function build-machine(component)    
    return machine.build component
