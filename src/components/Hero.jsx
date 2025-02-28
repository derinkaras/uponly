export default function Hero(){
    return(
        <>
            <h1 className="hero-h1">Finance Tracking for Those Who Only <abbr title="Stacking bread, cheddar, wealth, as it were">Run It Up</abbr>!</h1>
            <div className="benefits-list">
                <h3 className="font-bolder"> Run it up with <span className="text-gradient">UpOnly</span></h3>
                <p>✅ Track income, expenses & net worth in real time</p>
                <p>✅ Set & hit financial goals with smart insights</p>
                <p>✅ Stay in control—only green, never red</p>
            </div>
            <div className="card info-card">
                <div className = 'main-card-div'>
                    <i className="fa-solid fa-circle-info"></i>
                    <h3>Did you know...</h3>
                </div>
                <h5 className="main-card-header"> Most people underestimate their spending by 30%? </h5>
                <p className="main-card-text">
                    This means the average person thinks they're spending $70 when they're actually spending $100. 
                    UpOnly eliminates this costly blind spot by showing you exactly where every dollar goes, in real-time. 
                    No more end-of-month surprises or wondering why your account balance is lower than expected. Our smart tracking 
                    replaces uncertainty with crystal-clear insights, so you can make confident money moves and watch your wealth grow systematically.
                </p>
            </div>
        </>
    )
}