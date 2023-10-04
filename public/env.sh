#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
CFG="${SCRIPT_DIR}/env-config.js"
rm -rf "$CFG"
touch "$CFG"

echo "$CFG"
# Add assignment
echo "window._env_ = {" > "$CFG"

printenv >> vars

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  if [[ $line = \_* ]] ; then
    continue
  fi

  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}

  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> "$CFG"
done < vars

rm vars

echo "};" >> "$CFG"

echo "generated $CFG with content"
#cat $CFG
