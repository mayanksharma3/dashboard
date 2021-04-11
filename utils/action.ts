interface Action {
    preProcessing(args: { id: string, variables: {[key: string]: string }});

}

export default Action;
