# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: schema.proto
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
    'schema.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0cschema.proto\x12\x05types\"1\n\nEnumOption\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\x15\n\x02ty\x18\x02 \x01(\x0b\x32\t.types.Ty\"H\n\x04\x45num\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\x0e\n\x06option\x18\x02 \x01(\r\x12\"\n\x07options\x18\x03 \x03(\x0b\x32\x11.types.EnumOption\"\xaf\x02\n\tPrimitive\x12\x0c\n\x02i8\x18\x01 \x01(\x05H\x00\x12\r\n\x03i16\x18\x02 \x01(\x05H\x00\x12\r\n\x03i32\x18\x03 \x01(\x05H\x00\x12\r\n\x03i64\x18\x04 \x01(\x03H\x00\x12\x0e\n\x04i128\x18\x05 \x01(\x0cH\x00\x12\x0c\n\x02u8\x18\x06 \x01(\rH\x00\x12\r\n\x03u16\x18\x07 \x01(\rH\x00\x12\r\n\x03u32\x18\x08 \x01(\rH\x00\x12\r\n\x03u64\x18\t \x01(\x04H\x00\x12\x0e\n\x04u128\x18\n \x01(\x0cH\x00\x12\x0e\n\x04u256\x18\x0b \x01(\x0cH\x00\x12\x0e\n\x04\x62ool\x18\x0c \x01(\x08H\x00\x12\x11\n\x07\x66\x65lt252\x18\r \x01(\x0cH\x00\x12\x14\n\nclass_hash\x18\x0e \x01(\x0cH\x00\x12\x1a\n\x10\x63ontract_address\x18\x0f \x01(\x0cH\x00\x12\x15\n\x0b\x65th_address\x18\x10 \x01(\x0cH\x00\x42\x10\n\x0eprimitive_type\"7\n\x06Struct\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\x1f\n\x08\x63hildren\x18\x02 \x03(\x0b\x32\r.types.Member\"$\n\x05\x41rray\x12\x1b\n\x08\x63hildren\x18\x01 \x03(\x0b\x32\t.types.Ty\"\xc7\x01\n\x02Ty\x12%\n\tprimitive\x18\x02 \x01(\x0b\x32\x10.types.PrimitiveH\x00\x12\x1b\n\x04\x65num\x18\x03 \x01(\x0b\x32\x0b.types.EnumH\x00\x12\x1f\n\x06struct\x18\x04 \x01(\x0b\x32\r.types.StructH\x00\x12\x1d\n\x05tuple\x18\x05 \x01(\x0b\x32\x0c.types.ArrayH\x00\x12\x1d\n\x05\x61rray\x18\x06 \x01(\x0b\x32\x0c.types.ArrayH\x00\x12\x13\n\tbytearray\x18\x07 \x01(\tH\x00\x42\t\n\x07ty_type\":\n\x06Member\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\x15\n\x02ty\x18\x02 \x01(\x0b\x32\t.types.Ty\x12\x0b\n\x03key\x18\x03 \x01(\x08\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'schema_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_ENUMOPTION']._serialized_start=23
  _globals['_ENUMOPTION']._serialized_end=72
  _globals['_ENUM']._serialized_start=74
  _globals['_ENUM']._serialized_end=146
  _globals['_PRIMITIVE']._serialized_start=149
  _globals['_PRIMITIVE']._serialized_end=452
  _globals['_STRUCT']._serialized_start=454
  _globals['_STRUCT']._serialized_end=509
  _globals['_ARRAY']._serialized_start=511
  _globals['_ARRAY']._serialized_end=547
  _globals['_TY']._serialized_start=550
  _globals['_TY']._serialized_end=749
  _globals['_MEMBER']._serialized_start=751
  _globals['_MEMBER']._serialized_end=809
# @@protoc_insertion_point(module_scope)
