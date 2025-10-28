import { Uri, Event } from 'vscode';

export interface Git {
    readonly repositories: Repository[];
    readonly onDidOpenRepository: Event<Repository>;
    readonly onDidCloseRepository: Event<Repository>;
}

export interface Repository {
    readonly rootUri: Uri;
    readonly inputBox: InputBox;
    readonly state: RepositoryState;
    diff(cached?: boolean): Promise<string>;
}

export interface InputBox {
    value: string;
}

export interface RepositoryState {
    readonly indexChanges: Change[];
    readonly workingTreeChanges: Change[];
}

export interface Change {
    readonly uri: Uri;
    readonly status: Status;
}

export enum Status {
    INDEX_MODIFIED,
    INDEX_ADDED,
    INDEX_DELETED,
    INDEX_RENAMED,
    INDEX_COPIED,
    MODIFIED,
    DELETED,
    UNTRACKED,
    IGNORED,
    ADDED_BY_US,
    ADDED_BY_THEM,
    DELETED_BY_US,
    DELETED_BY_THEM,
    BOTH_ADDED,
    BOTH_DELETED,
    BOTH_MODIFIED,
}

export interface API {
    readonly git: Git;
}

export interface GitExtension {
    readonly enabled: boolean;
    readonly onDidChangeEnablement: Event<boolean>;
    getAPI(version: 1): Git;
}
