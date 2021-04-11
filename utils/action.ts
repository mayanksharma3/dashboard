abstract class Action {

    configVariables: { [key: string]: string }

    protected constructor(configVariables: { [key: string]: string }) {
        this.configVariables = configVariables;
    }

    abstract preProcessing(args: { id: string, variables: { [key: string]: string } });

}

export default Action;
