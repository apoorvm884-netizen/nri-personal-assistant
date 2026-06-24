import buildInfo from '../lib/buildInfo'

export default function VersionFooter() {
  return (
    <div className="border-t border-charcoal-100 px-4 md:px-6 py-3 bg-white/50 text-center">
      <p className="text-[10px] text-charcoal-400 font-mono">
        Version {buildInfo.formattedVersion} | Build Time: {buildInfo.formattedTimestamp} | Deployment ID: {buildInfo.deploymentId} | Commit: {buildInfo.commitHash}
      </p>
    </div>
  )
}