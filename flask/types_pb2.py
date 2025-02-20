# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: types.proto
# Protobuf Python Version: 5.29.0
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    29,
    0,
    '',
    'types.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


import schema_pb2 as schema__pb2


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0btypes.proto\x12\x05types\x1a\x0cschema.proto\"L\n\rWorldMetadata\x12\x15\n\rworld_address\x18\x01 \x01(\t\x12$\n\x06models\x18\x05 \x03(\x0b\x32\x14.types.ModelMetadata\"\xaa\x01\n\rModelMetadata\x12\x11\n\tnamespace\x18\x01 \x01(\t\x12\x0c\n\x04name\x18\x02 \x01(\t\x12\x13\n\x0bpacked_size\x18\x03 \x01(\r\x12\x15\n\runpacked_size\x18\x04 \x01(\r\x12\x12\n\nclass_hash\x18\x05 \x01(\t\x12\x0e\n\x06layout\x18\x06 \x01(\x0c\x12\x0e\n\x06schema\x18\x07 \x01(\x0c\x12\x18\n\x10\x63ontract_address\x18\x08 \x01(\t\"<\n\x06\x45ntity\x12\x13\n\x0bhashed_keys\x18\x01 \x01(\x0c\x12\x1d\n\x06models\x18\x02 \x03(\x0b\x32\r.types.Struct\"=\n\x05\x45vent\x12\x0c\n\x04keys\x18\x01 \x03(\x0c\x12\x0c\n\x04\x64\x61ta\x18\x02 \x03(\x0c\x12\x18\n\x10transaction_hash\x18\x03 \x01(\x0c\"*\n\x0cStorageEntry\x12\x0b\n\x03key\x18\x01 \x01(\t\x12\r\n\x05value\x18\x02 \x01(\t\"L\n\x0bStorageDiff\x12\x0f\n\x07\x61\x64\x64ress\x18\x01 \x01(\t\x12,\n\x0fstorage_entries\x18\x02 \x03(\x0b\x32\x13.types.StorageEntry\"6\n\tModelDiff\x12)\n\rstorage_diffs\x18\x01 \x03(\x0b\x32\x12.types.StorageDiff\"G\n\x0bModelUpdate\x12\x12\n\nblock_hash\x18\x01 \x01(\t\x12$\n\nmodel_diff\x18\x02 \x01(\x0b\x32\x10.types.ModelDiff\"\xbe\x01\n\x05Query\x12\x1d\n\x06\x63lause\x18\x01 \x01(\x0b\x32\r.types.Clause\x12\r\n\x05limit\x18\x02 \x01(\r\x12\x0e\n\x06offset\x18\x03 \x01(\r\x12 \n\x18\x64ont_include_hashed_keys\x18\x04 \x01(\x08\x12 \n\x08order_by\x18\x05 \x03(\x0b\x32\x0e.types.OrderBy\x12\x15\n\rentity_models\x18\x06 \x03(\t\x12\x1c\n\x14\x65ntity_updated_after\x18\x07 \x01(\x04\"L\n\nEventQuery\x12\x1f\n\x04keys\x18\x01 \x01(\x0b\x32\x11.types.KeysClause\x12\r\n\x05limit\x18\x02 \x01(\r\x12\x0e\n\x06offset\x18\x03 \x01(\r\"\xbe\x01\n\x06\x43lause\x12.\n\x0bhashed_keys\x18\x01 \x01(\x0b\x32\x17.types.HashedKeysClauseH\x00\x12!\n\x04keys\x18\x02 \x01(\x0b\x32\x11.types.KeysClauseH\x00\x12%\n\x06member\x18\x03 \x01(\x0b\x32\x13.types.MemberClauseH\x00\x12+\n\tcomposite\x18\x04 \x01(\x0b\x32\x16.types.CompositeClauseH\x00\x42\r\n\x0b\x63lause_type\".\n\x0fModelKeysClause\x12\r\n\x05model\x18\x02 \x01(\t\x12\x0c\n\x04keys\x18\x03 \x03(\x0c\"t\n\x10\x45ntityKeysClause\x12.\n\x0bhashed_keys\x18\x01 \x01(\x0b\x32\x17.types.HashedKeysClauseH\x00\x12!\n\x04keys\x18\x02 \x01(\x0b\x32\x11.types.KeysClauseH\x00\x42\r\n\x0b\x63lause_type\"\\\n\nKeysClause\x12\x0c\n\x04keys\x18\x02 \x03(\x0c\x12\x30\n\x10pattern_matching\x18\x03 \x01(\x0e\x32\x16.types.PatternMatching\x12\x0e\n\x06models\x18\x04 \x03(\t\"\'\n\x10HashedKeysClause\x12\x13\n\x0bhashed_keys\x18\x01 \x03(\x0c\"|\n\x0bMemberValue\x12%\n\tprimitive\x18\x01 \x01(\x0b\x32\x10.types.PrimitiveH\x00\x12\x10\n\x06string\x18\x02 \x01(\tH\x00\x12&\n\x04list\x18\x03 \x01(\x0b\x32\x16.types.MemberValueListH\x00\x42\x0c\n\nvalue_type\"5\n\x0fMemberValueList\x12\"\n\x06values\x18\x01 \x03(\x0b\x32\x12.types.MemberValue\"}\n\x0cMemberClause\x12\r\n\x05model\x18\x02 \x01(\t\x12\x0e\n\x06member\x18\x03 \x01(\t\x12+\n\x08operator\x18\x04 \x01(\x0e\x32\x19.types.ComparisonOperator\x12!\n\x05value\x18\x05 \x01(\x0b\x32\x12.types.MemberValue\"[\n\x0f\x43ompositeClause\x12(\n\x08operator\x18\x03 \x01(\x0e\x32\x16.types.LogicalOperator\x12\x1e\n\x07\x63lauses\x18\x04 \x03(\x0b\x32\r.types.Clause\"u\n\x05Token\x12\x10\n\x08token_id\x18\x01 \x01(\x0c\x12\x18\n\x10\x63ontract_address\x18\x02 \x01(\x0c\x12\x0c\n\x04name\x18\x03 \x01(\t\x12\x0e\n\x06symbol\x18\x04 \x01(\t\x12\x10\n\x08\x64\x65\x63imals\x18\x05 \x01(\r\x12\x10\n\x08metadata\x18\x06 \x01(\x0c\"d\n\x0cTokenBalance\x12\x0f\n\x07\x62\x61lance\x18\x01 \x01(\x0c\x12\x17\n\x0f\x61\x63\x63ount_address\x18\x02 \x01(\x0c\x12\x18\n\x10\x63ontract_address\x18\x03 \x01(\x0c\x12\x10\n\x08token_id\x18\x04 \x01(\x0c\"R\n\x07OrderBy\x12\r\n\x05model\x18\x01 \x01(\t\x12\x0e\n\x06member\x18\x02 \x01(\t\x12(\n\tdirection\x18\x03 \x01(\x0e\x32\x15.types.OrderDirection\"N\n\nController\x12\x0f\n\x07\x61\x64\x64ress\x18\x01 \x01(\x0c\x12\x10\n\x08username\x18\x02 \x01(\t\x12\x1d\n\x15\x64\x65ployed_at_timestamp\x18\x03 \x01(\x04*0\n\x0fPatternMatching\x12\x0c\n\x08\x46ixedLen\x10\x00\x12\x0f\n\x0bVariableLen\x10\x01*\"\n\x0fLogicalOperator\x12\x07\n\x03\x41ND\x10\x00\x12\x06\n\x02OR\x10\x01*[\n\x12\x43omparisonOperator\x12\x06\n\x02\x45Q\x10\x00\x12\x07\n\x03NEQ\x10\x01\x12\x06\n\x02GT\x10\x02\x12\x07\n\x03GTE\x10\x03\x12\x06\n\x02LT\x10\x04\x12\x07\n\x03LTE\x10\x05\x12\x06\n\x02IN\x10\x06\x12\n\n\x06NOT_IN\x10\x07*#\n\x0eOrderDirection\x12\x07\n\x03\x41SC\x10\x00\x12\x08\n\x04\x44\x45SC\x10\x01\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'types_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_PATTERNMATCHING']._serialized_start=2214
  _globals['_PATTERNMATCHING']._serialized_end=2262
  _globals['_LOGICALOPERATOR']._serialized_start=2264
  _globals['_LOGICALOPERATOR']._serialized_end=2298
  _globals['_COMPARISONOPERATOR']._serialized_start=2300
  _globals['_COMPARISONOPERATOR']._serialized_end=2391
  _globals['_ORDERDIRECTION']._serialized_start=2393
  _globals['_ORDERDIRECTION']._serialized_end=2428
  _globals['_WORLDMETADATA']._serialized_start=36
  _globals['_WORLDMETADATA']._serialized_end=112
  _globals['_MODELMETADATA']._serialized_start=115
  _globals['_MODELMETADATA']._serialized_end=285
  _globals['_ENTITY']._serialized_start=287
  _globals['_ENTITY']._serialized_end=347
  _globals['_EVENT']._serialized_start=349
  _globals['_EVENT']._serialized_end=410
  _globals['_STORAGEENTRY']._serialized_start=412
  _globals['_STORAGEENTRY']._serialized_end=454
  _globals['_STORAGEDIFF']._serialized_start=456
  _globals['_STORAGEDIFF']._serialized_end=532
  _globals['_MODELDIFF']._serialized_start=534
  _globals['_MODELDIFF']._serialized_end=588
  _globals['_MODELUPDATE']._serialized_start=590
  _globals['_MODELUPDATE']._serialized_end=661
  _globals['_QUERY']._serialized_start=664
  _globals['_QUERY']._serialized_end=854
  _globals['_EVENTQUERY']._serialized_start=856
  _globals['_EVENTQUERY']._serialized_end=932
  _globals['_CLAUSE']._serialized_start=935
  _globals['_CLAUSE']._serialized_end=1125
  _globals['_MODELKEYSCLAUSE']._serialized_start=1127
  _globals['_MODELKEYSCLAUSE']._serialized_end=1173
  _globals['_ENTITYKEYSCLAUSE']._serialized_start=1175
  _globals['_ENTITYKEYSCLAUSE']._serialized_end=1291
  _globals['_KEYSCLAUSE']._serialized_start=1293
  _globals['_KEYSCLAUSE']._serialized_end=1385
  _globals['_HASHEDKEYSCLAUSE']._serialized_start=1387
  _globals['_HASHEDKEYSCLAUSE']._serialized_end=1426
  _globals['_MEMBERVALUE']._serialized_start=1428
  _globals['_MEMBERVALUE']._serialized_end=1552
  _globals['_MEMBERVALUELIST']._serialized_start=1554
  _globals['_MEMBERVALUELIST']._serialized_end=1607
  _globals['_MEMBERCLAUSE']._serialized_start=1609
  _globals['_MEMBERCLAUSE']._serialized_end=1734
  _globals['_COMPOSITECLAUSE']._serialized_start=1736
  _globals['_COMPOSITECLAUSE']._serialized_end=1827
  _globals['_TOKEN']._serialized_start=1829
  _globals['_TOKEN']._serialized_end=1946
  _globals['_TOKENBALANCE']._serialized_start=1948
  _globals['_TOKENBALANCE']._serialized_end=2048
  _globals['_ORDERBY']._serialized_start=2050
  _globals['_ORDERBY']._serialized_end=2132
  _globals['_CONTROLLER']._serialized_start=2134
  _globals['_CONTROLLER']._serialized_end=2212
# @@protoc_insertion_point(module_scope)
