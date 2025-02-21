#!/bin/bash

COMMANDS_FILE="commands.txt"

if [[ ! -f "$COMMANDS_FILE" ]];  then
    echo "Файл $COMMANDS_FILE не найден!"
    exit 1
fi

trap "echo  'Прерывание! Выход из скрипта.'; exit 0" SIGINT

while IFS= read -r line || [[ -n "$line" ]]; do
    # Если строка пуста – пропускаем
    if [[ -z "$line" ]]; then
        continue
    fi
    
    echo "Выполняю: $line"
    eval "$line"
    sleep 3
done < "$COMMANDS_FILE"
