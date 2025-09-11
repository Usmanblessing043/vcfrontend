function Button(props) {
   
    return(
        <div>
           <button onClick={props.in} className={props.sty}>{props.text}</button>
        </div>
    )
        
    
    
}
export default Button