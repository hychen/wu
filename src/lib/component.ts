/** Module Component
 *
 * Copyright (c) 2015 Chen Hsin-Yi
 * MIT License, see LICENSE file for full terms.
 */
import TK = require('./token');

export interface ExitCallbacks {
    [key: string]: (any) => any;
}

interface BaseComponent {
    /* A display name for the component.
     * - Sentence-case (like a normal sentence)
     * - No ending punctuation.
     */
    friendlyName: string;
    /* Clear, 1 sentence description in the imperative mood.
     */
    description?: string;
    /* Provides supplemental info on top of description.
     */
    extendedDescription?: string;
    /**
     * This optional URL points to somewhere where additional information
     * about the underlying functionality in this component can be found.
     *
     * Be sure and use a fully qualified URL like http://foo.com/bar/baz.
     */
    moreInfoUrl?: string;
    // Can this component be cached?
    cacheable?: boolean;
    // Sync?
    sync?: boolean;
}

export interface ActComponent extends BaseComponent {
    fn: () => any;
}

export interface SourceActComponent extends BaseComponent {
    defaultExit?: string;
    exits: Object;
    fn: (inputs: TK.Token, exits: ExitCallbacks) => any;
}

export interface PipeActComponent extends BaseComponent {
    inputs: Object;
    defaultExit?: string;
    exits: Object;
    fn: (inputs:TK.Token, exits: ExitCallbacks) => any;
}

export interface DestinationActComponent extends BaseComponent {
    inputs: Object;
    fn: (inputs: TK.Token, exits: ExitCallbacks) => any;
}

export type Component = ActComponent
                    | SourceActComponent
                    | PipeActComponent
                    | DestinationActComponent

export interface ComponentSource {
    provideComponent(options?: Object);
}

export function ensuredComponent(component: Component): Component {
    if(component['inputs'] == null){
        component['inputs'] = {};
    }
    if(component['exits'] == null){
        component['exits'] = {};
    }
    return component;
}

/** load a component source from a component source file.
 * @param {string} fpath - the path of a source file.
 * @returns {ComponentSource}
 * @throws {Error} when provideComponent function is not defined in the source file.
 */
export function loadComponentSource(fpath: string): ComponentSource {
    var mod = require(fpath);
    if(typeof mod.provideComponent != 'function')
        throw new Error('provideComponent function is not defined.');
    return mod;
}

/** load a component from a component source file.
 * @param {string} fpath - the path of a source file.
 * @param {Object} options - options. (optional)
 * @returns {Component}
 * @throws {Error} when provideComponent function is not defined in the source file.
 */
export function loadComponent(fpath: string, options?: Object): Component {
    var mod = loadComponentSource(fpath);
    if(options){
        return mod.provideComponent(options);
    }else{
        return mod.provideComponent();
    }
}
