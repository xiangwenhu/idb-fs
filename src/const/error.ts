export const ErrorCodeMap: Record<string, {code: string, message: string}> = {
    // ==== 核心 DOM 错误 (1-24) ====
    1: { code: 'IndexSizeError', message: 'Index or size is out of the allowed range' },
    2: { code: 'DOMStringSizeError', message: 'String exceeds platform length limit' }, // 已弃用
    3: { code: 'HierarchyRequestError', message: 'Node tree insertion violates hierarchy' },
    4: { code: 'WrongDocumentError', message: 'Cross-document node operation attempted' },
    5: { code: 'InvalidCharacterError', message: 'Contains invalid/unsupported characters' },
    6: { code: 'NoDataAllowedError', message: 'Data operations not allowed on this node' }, // 已弃用
    7: { code: 'NoModificationAllowedError', message: 'Object cannot be modified in this context' },
    8: { code: 'NotFoundError', message: 'Requested object does not exist' },
    9: { code: 'NotSupportedError', message: 'Operation not supported by implementation' },
    10: { code: 'InUseAttributeError', message: 'Attribute is already in use' }, // 已弃用
    11: { code: 'InvalidStateError', message: 'Object is in an invalid state for this operation' },
    12: { code: 'SyntaxError', message: 'Invalid syntax in request' },
    13: { code: 'InvalidModificationError', message: 'Illegal type modification attempted' },
    14: { code: 'NamespaceError', message: 'XML namespace declaration error' },
    15: { code: 'InvalidAccessError', message: 'Unauthorized object/method access' }, // 已弃用
    16: { code: 'TypeMismatchError', message: 'Object type does not match expected' }, // 已弃用
    17: { code: 'SecurityError', message: 'Security policy violation detected' },
    18: { code: 'NetworkError', message: 'Network communication failure occurred' },
    19: { code: 'AbortError', message: 'Operation was explicitly aborted' },
    20: { code: 'URLMismatchError', message: 'URL does not match execution context' },
    21: { code: 'QuotaExceededError', message: 'Storage quota exceeded for this operation' },
    22: { code: 'TimeoutError', message: 'Operation timed out before completion' },
    23: { code: 'InvalidNodeTypeError', message: 'Node type invalid for this operation' },
    24: { code: 'DataCloneError', message: 'Object cannot be cloned/serialized' },

    // ==== 现代 API 扩展错误 (25-41) ====
    25: { code: 'EncodingError', message: 'Text encoding/decoding operation failed' },
    26: { code: 'NotReadableError', message: 'Requested resource is not readable' },
    27: { code: 'UnknownError', message: 'An unknown error occurred' },
    28: { code: 'ConstraintError', message: 'Database constraint violation occurred' },
    29: { code: 'DataError', message: 'Invalid data provided for operation' },
    30: { code: 'TransactionInactiveError', message: 'Transaction is not active' },
    31: { code: 'ReadOnlyError', message: 'Write operation on read-only object' },
    32: { code: 'VersionError', message: 'Database version conflict detected' },
    33: { code: 'OperationError', message: 'Generic operation failure' }, // 已弃用
    34: { code: 'NotAllowedError', message: 'Permission denied for this operation' },
    35: { code: 'UnknownKeyTypeError', message: 'Unsupported key type in IndexedDB' },
    36: { code: 'KeyExistsError', message: 'Duplicate key in database operation' },
    37: { code: 'InvalidKeyError', message: 'Invalid key provided for operation' },
    38: { code: 'InvalidLockGrantError', message: 'Web Lock API grant request rejected' },
    39: { code: 'InvalidPathError', message: 'File system path contains invalid segments' },
    40: { code: 'NoSuchEntryError', message: 'Requested entry does not exist in file system' },
    41: { code: 'EntryExistsError', message: 'File system entry already exists at target path' }
};