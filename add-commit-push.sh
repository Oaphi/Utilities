#!/usr/bin/env bash

#adds files to GIT and commits
add_commit() {
    git add $1 && git commit -m "$2"
}

#counts number of changed files
count_changes() {
    counter=0

    for i in $(git status -s); do counter=$(($counter + 1)); done

    actual=$(($counter / 2))

    echo $actual
}

#trims control chars
trim_control() {
    echo $(tr -d "[:cntrl:]" <<<$1)
}

#prompt for message until set something
prompt_until_set() {

    echo -e "Enter commit message\n"

    read $(echo $1)

    while [[ -z ${!1} ]]; do
        prompt_until_set $1
    done
}

#pushes upstream [force-pushing]
push_upstream() {
    git push $1 || . ./git-auth.sh &&
        git push $1 && echo "Push successful, exiting"
}

display_menu() {

    echo "$2"

    PS3="Chose: "

    select choice in $1; do
        [[ -z $choice ]] &&
            display_menu "$@" ||
            read -e $3 <<<$choice && break
    done

}

#parse positional argss
for option in $@; do
    case $option in
    "-f") echo -e "-f\tUsing force-push" && FORCE="-f" ;;
    "-nt") echo -e "-nt\tIgnoring testing stage" && TEST=0 ;;
    esac
done

echo ""

#Workflow:
#1. Set force-push and test ignore
#1-test. Run test npm script, exit on failure
#1-force. Set forceful push
#2. Check if anything to add to staged, if any:
#2'. Ask to commit everything, then:
#2'-yes. Add all
#2'-no. Ask to add files manually
#2'. Add to staged and commit
#3. Ask to push upstream:
#3-yes. Push upstream
#3-no. notify and exit

((TEST)) && (npm run test || echo "Test failed" && exit)

[[ -z $(git status -s) ]] && STAGED=0 && echo "[SKIP] add & commit (clean)" || STAGED=1

((STAGED)) && display_menu "yes no none" "Commit all?" ALL

case $ALL in
yes | no)
    {
        [[ $ALL == "yes" ]] && ADD="." ||
            read -p "Add manually: " ADD &&
            { [[ -n $1 ]] && DEF_MSG="Updated $(count_changes) file(s)" || MSG=$1; } &&
            read -p "Use default commit message ($DEF_MSG) [yes|no]? " USE_DEF &&
            { [[ $USE_DEF != "yes" ]] && prompt_until_set MSG || MSG=$DEF_MSG; } &&
            add_commit "$ADD" "$(trim_control "$MSG")"
    }
    ;;
*)
    echo "[SKIP] not committing"
    ;;
esac

read -p "Push upstream? [yes|no] " PUSH

[[ $PUSH == "yes" ]] && push_upstream $FORCE || echo "Push aborted, exiting"
